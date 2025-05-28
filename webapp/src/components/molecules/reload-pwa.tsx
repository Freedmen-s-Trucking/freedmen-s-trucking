import { Alert } from "flowbite-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { PrimaryButton } from "../atoms";
import { HiInformationCircle } from "react-icons/hi";

const ReloadPwaAlert: React.FC = () => {
  const period = 5 * 60 * 1000;

  const {
    // offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  function close() {
    // setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 m-0 p-0">
      {needRefresh && (
        <Alert
          color="warning"
          icon={HiInformationCircle}
          onDismiss={() => {
            close();
          }}
          rounded
          className="absolute left-1/2 top-2 z-[60] w-72 max-w-sm -translate-x-1/2 border border-primary-100 bg-primary-50 shadow-lg"
          additionalContent={
            <div className="flex flex-col gap-2">
              <span id="toast-message">Click on reload button to update.</span>
              <div className="flex flex-row justify-end gap-2">
                <PrimaryButton
                  className="py-2"
                  onClick={() => updateServiceWorker(true)}
                >
                  Reload
                </PrimaryButton>
              </div>
            </div>
          }
        >
          <span className="font-bold">New release available</span>
        </Alert>
      )}
    </div>
  );
};

export default ReloadPwaAlert;

/**
 * Registers a periodic sync check every period.
 *
 * @param {number} period - The period in milliseconds.
 * @param {string} swUrl - The service worker URL.
 * @param {ServiceWorkerRegistration} r - The service worker registration.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
