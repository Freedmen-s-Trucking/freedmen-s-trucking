import { useState, useRef, useEffect, useCallback } from "react";
import { useGeolocated } from "react-geolocated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/hooks/use-auth";
import { useDbOperations } from "~/hooks/use-firestore";
import { Modal, Button, Spinner, Tooltip } from "flowbite-react";
import { Camera } from "lucide-react";
import { PrimaryButton, SecondaryButton, TextInput } from "~/components/atoms";
import { DriverOrderStatus } from "@freedmen-s-trucking/types";
import { useServerRequest } from "~/hooks/use-server-request";
import { isResponseError } from "up-fetch";
import { BsExclamationCircle } from "react-icons/bs";
import { useStorageOperations } from "~/hooks/use-storage";

function dataURLtoBlob(dataURL: string) {
  // Split the dataURL to get the base64 data and MIME type
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]); // Decode base64 string

  // Create ArrayBuffer and Uint8Array
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

const GetNextActionButton = ({
  orderPath,
  action,
}: {
  orderPath: string;
  action: {
    action: string;
    color: string;
    badge: React.ReactNode;
    nextStatus: DriverOrderStatus | null;
    nextStatusDescription: string;
    nextStatusConfirmation: string;
  };
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { updateOrderStatus } = useDbOperations();
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Camera related states
  const [showCamera, setShowCamera] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (
    videoRef.current &&
    streamRef.current &&
    videoRef.current.srcObject !== streamRef.current
  ) {
    console.log("Setting stream");
    videoRef.current.srcObject = streamRef.current;
  }
  (window as unknown as Record<string, unknown>).gg = {
    action,
    cameraReady,
    cameraLoading,
    videoRef,
    canvasRef,
    streamRef,
  };

  const nextActionRequiresGeolocation = [
    DriverOrderStatus.DELIVERED,
    DriverOrderStatus.ON_THE_WAY_TO_PICKUP,
    DriverOrderStatus.ON_THE_WAY_TO_DELIVER,
  ].includes(action.nextStatus || DriverOrderStatus.WAITING);

  const needsDeliveryPhotoAndCode =
    action.nextStatus === DriverOrderStatus.DELIVERED;

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Function to start the camera
  const startCamera = useCallback(async () => {
    setCameraLoading(true);
    setError(null);

    // Close any existing streams first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      // First try environment camera (rear)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch (envError) {
        console.log("Failed to access environment camera:", envError);
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Setup video element
        videoRef.current.muted = true; // Important for autoplay to work

        // Listen for when video is ready
        videoRef.current.onloadedmetadata = () => {
          console.log(
            "Video metadata loaded",
            videoRef.current,
            streamRef.current,
          );

          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setCameraReady(true);
                setCameraLoading(false);
              })
              .catch((e) => {
                console.error("Error playing video:", e);
                setError(`Video playback error: ${e.message}`);
                setCameraLoading(false);
              });
          }
        };
      }
    } catch (err: unknown) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        setError(`Camera access error: ${err.message}`);
      } else {
        setError("Camera access error: Unknown error");
      }
      setCameraLoading(false);
    }
  }, [videoRef, streamRef]);

  // Function to capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Handle case where video dimensions aren't ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error("Video dimensions not available");
        setError("Cannot capture photo: video not initialized properly");
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const context = canvas.getContext("2d");
      if (!context) {
        setError("Cannot capture photo: canvas context not available");
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data as base64 string with compression
      const photo = canvas.toDataURL("image/jpeg", 0.7); // 0.7 quality for better file size

      if (!photo || photo === "data:,") {
        throw new Error("Failed to capture image");
      }

      setImageData(photo);
      console.log("Photo captured successfully");

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setShowCamera(false);
      setCameraReady(false);
    } catch (err) {
      console.error("Error during photo capture:", err);
      if (err instanceof Error) {
        setError(`Photo capture error: ${err.message}`);
      } else {
        setError("Photo capture error: Unknown error");
      }
    }
  };

  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
  }, [showCamera, startCamera]);

  // Function to retake photo
  const retakePhoto = () => {
    setImageData(null);
    setCameraReady(false);

    // Wait a bit before restarting camera
    setTimeout(() => {
      startCamera();
    }, 300);
  };

  const ConfirmModal = () => {
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
      useGeolocated({
        positionOptions: {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 5000,
        },
        isOptimisticGeolocationEnabled: false,
        userDecisionTimeout: 5000,
        watchLocationPermissionChange: true,
        watchPosition: true,
        onError(positionError) {
          if (positionError) {
            console.error("Geolocation error:", positionError);
          }
        },
      });

    const { uploadOrderPackageDelivered } = useStorageOperations();
    const { mutate: moveToNextStatus } = useMutation({
      mutationFn: async ({ deliveryCode }: { deliveryCode: string }) => {
        if (!action.nextStatus) {
          alert("No next status found");
          return true;
        }

        let error = null;
        if (!isGeolocationAvailable) {
          error = "Your browser does not support Geolocation";
        } else if (!isGeolocationEnabled) {
          error =
            "Geolocation is not enabled, please enable it in your browser settings.";
        }

        if (error) {
          setError(error);
          alert(`Error is ${JSON.stringify(error)}`);
          return false;
        }

        if (!coords) {
          setError("Unable To get the location, please try again.");
          alert("Unable To get the location, please try again.");
          return false;
        }

        // Check if we need a delivery photo but don't have one
        if (needsDeliveryPhotoAndCode && !imageData) {
          setError("Please take a photo of the delivered order.");
          alert("Please take a photo of the delivered order.");
          return false;
        }

        if (needsDeliveryPhotoAndCode && !deliveryCode) {
          setError("Please enter the delivery code.");
          alert("Please enter the delivery code.");
          return false;
        }

        let deliveredOrderConfirmationImagePath = null;
        if (imageData) {
          const blobImg = dataURLtoBlob(imageData);
          const file = new File([blobImg], `package-delivered-${Date.now()}`, {
            type: blobImg.type,
          });

          const res = await uploadOrderPackageDelivered(
            orderPath.split("/").pop() || "",
            file,
          );

          deliveredOrderConfirmationImagePath = res;
        }

        await updateOrderStatus({
          userId: user.info.uid,
          orderPath,
          driverStatus: action.nextStatus,
          coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          ...(!!needsDeliveryPhotoAndCode && {
            deliveredOrderConfirmationImage:
              deliveredOrderConfirmationImagePath,
            driverConfirmationCode: deliveryCode,
          }),
        });

        return true;
      },
      onMutate: () => {
        console.log("Moving to next status for order", orderPath);
        setIsLoading(true);
      },
      onSuccess: (data) => {
        setIsLoading(false);
        if (!data) return;
        setShowStatusChangeModal(false);
        setImageData(null);
        queryClient.invalidateQueries({ queryKey: ["driverInfo"] });
        setTimeout(
          () => queryClient.invalidateQueries({ queryKey: ["historyOrders"] }),
          3000,
        );
      },
      onError: (error) => {
        console.error("Failed to update order status:", error);
        alert(`Failed to update order status: ${JSON.stringify(error)}`);
        setIsLoading(false);
        // setShowStatusChangeModal(false);
      },
    });

    const serverRequest = useServerRequest();
    const submitStatusChange = async (ev: React.FormEvent<HTMLFormElement>) => {
      setError(null);
      ev.preventDefault();
      if (!needsDeliveryPhotoAndCode) {
        moveToNextStatus({ deliveryCode: "" });
        return;
      }
      const fd = new FormData(ev.currentTarget || ev.target);
      const deliveryCode = fd.get("deliveryCode");
      if (deliveryCode instanceof File || !deliveryCode) {
        setError("Please enter a valid delivery code");
        return;
      }
      try {
        const deliveryVerified = await serverRequest(
          "/order/verify-delivery-code",
          {
            method: "POST",
            body: {
              deliveryCode,
              orderId: orderPath.split("/").pop() || "",
            },
          },
        );
        if (deliveryVerified.success) {
          moveToNextStatus({ deliveryCode });
          return;
        }
        setError("Delivery code verification failed");
        return;
      } catch (err) {
        if (isResponseError(err)) {
          console.error("Failed to verify delivery code:", err);
          setError(`Code check failed: ${err.data?.error || "Unknown error"}`);
          return;
        }
        setError(`Failed to verify delivery code ${JSON.stringify(err)}`);
        return;
      }
    };

    const handleModalClose = () => {
      // Ensure camera is properly cleaned up when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setShowCamera(false);
      setImageData(null);
      setCameraReady(false);
      setShowStatusChangeModal(false);
    };

    // Add this effect to reattach stream after re-renders
    useEffect(() => {
      if (
        videoRef.current &&
        videoRef.current.srcObject === null &&
        streamRef.current
      ) {
        console.log(
          "Reattaching stream",
          videoRef.current?.srcObject,
          streamRef.current,
        );
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        videoRef.current
          .play()
          .catch((e) => console.log("Reattach play error:", e));
      }
    });

    return (
      <Modal size="md" show={showStatusChangeModal} onClose={handleModalClose}>
        <Modal.Header className="[&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all [&>button]:duration-300 hover:[&>button]:scale-110 hover:[&>button]:text-primary-950">
          <span className="text-lg font-medium">Confirm Action</span>
        </Modal.Header>
        <Modal.Body className="text-secondary-950">
          <p className="mb-4">{action.nextStatusConfirmation}</p>

          {/* Photo capture section for delivery confirmation */}
          {needsDeliveryPhotoAndCode && (
            <div className="mb-4">
              <h4 className="mb-2 font-medium">Delivery Photo</h4>

              {!showCamera && !imageData && (
                <div className="relative mb-2 h-80 w-full overflow-hidden rounded-lg bg-gray-100">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <SecondaryButton
                      onClick={() => setShowCamera(true)}
                      className="my-2 flex items-center gap-2 px-6 py-2"
                    >
                      <Camera size={18} />
                      Retake Photo
                    </SecondaryButton>
                  </div>
                </div>
              )}

              {showCamera && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-2 w-full overflow-hidden rounded-lg bg-gray-100">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-80 w-full object-cover"
                    />

                    {/* Loading overlay while camera initializes */}
                    {(cameraLoading || !cameraReady) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 text-gray-700">
                        <Spinner size="xl" />
                        <span className="ml-2">Activating camera...</span>
                      </div>
                    )}
                    {!cameraLoading && cameraReady && (
                      <div className="absolute inset-0 flex flex-col items-center justify-end bg-opacity-75 text-gray-700">
                        <SecondaryButton
                          onClick={capturePhoto}
                          className="my-2 px-6 py-2"
                          disabled={!cameraReady}
                        >
                          Capture
                        </SecondaryButton>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {imageData && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-2 w-full overflow-hidden rounded-lg">
                    <img
                      src={imageData}
                      alt="Captured delivery"
                      className="h-80 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-end">
                      <SecondaryButton
                        onClick={retakePhoto}
                        className="my-2 px-6 py-2"
                      >
                        Retake Photo
                      </SecondaryButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden canvas for capturing photo */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          <form onSubmit={submitStatusChange} className="flex flex-col gap-8">
            {needsDeliveryPhotoAndCode && (
              <label>
                Delivery Code <BsExclamationCircle className="m-1 inline" />
                <TextInput
                  className="text-center text-5xl font-bold tracking-[1rem]"
                  placeholder="123456"
                  maxLength={6}
                  value={deliveryCode}
                  onChange={(e) => setDeliveryCode(e.target.value)}
                  required
                  name="deliveryCode"
                />
              </label>
            )}
            {nextActionRequiresGeolocation && !coords && (
              <p className="text-sm text-orange-500">
                {isGeolocationAvailable && !isGeolocationEnabled
                  ? "Enable Geolocation Access To continue"
                  : isGeolocationAvailable
                    ? "Wait for location to be retrieved."
                    : "Geolocation is not available in this browser."}
              </p>
            )}
            {error && (
              <p className="pt-2 italic text-red-500 underline">{error}</p>
            )}
            <PrimaryButton
              type="submit"
              isLoading={isLoading}
              disabled={
                (nextActionRequiresGeolocation && !coords) ||
                (needsDeliveryPhotoAndCode && !imageData)
              }
              style={{ backgroundColor: action.color }}
              className="self-end py-2 text-white"
            >
              Confirm
            </PrimaryButton>
          </form>
        </Modal.Body>
      </Modal>
    );
  };

  if (!action) return null;

  return (
    <>
      <Tooltip content={action.nextStatusDescription} placement="top">
        <Button
          color={action.color}
          size="sm"
          className="disabled:opacity-100 [&>span]:flex [&>span]:flex-row [&>span]:items-center [&>span]:justify-center [&>span]:gap-2"
          disabled={isLoading || !action.nextStatus}
          onClick={() => setShowStatusChangeModal(true)}
        >
          {isLoading && <Spinner />}
          {action.action}
        </Button>
      </Tooltip>
      {showStatusChangeModal && <ConfirmModal />}
    </>
  );
};

export default GetNextActionButton;
