import { createFileRoute } from "@tanstack/react-router";
import { VerificationCode } from "../../../components/organisms/VerificationCode";
import { useAppSelector } from "../../../stores/hooks";

export const Route = createFileRoute("/app/agents/agent-otp")({
//   beforeLoad({ context }) {
//     // Redirect if user is already authenticated
//     if (context.user?.isAnonymous === false) {
//       throw redirect({
//         to: "/app/customer/dashboard",
//       });
//     }
//   },
  component: AgentOtpScreen,
});

function AgentOtpScreen() {
  const phoneNumber = useAppSelector((state) => state.authCtrl.user?.info.phoneNumber || "");

  const handleVerify = async (code: string) => {
    // TODO: Implement verification logic
    console.log("Verifying code:", code);
  };

  return (
    <div className="min-h-screen bg-white">
      <VerificationCode 
        phoneNumber={phoneNumber || ""}
        onVerify={handleVerify}
        isAgent={true}
      />
    </div>
  );
} 