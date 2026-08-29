import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { NotificationService, NotificationEventType } from "@/lib/notification-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบก่อนทดสอบส่ง Notification", 401);
    }

    const body = await req.json();
    const { eventType, eventTitle = "Nakhon Pathom Half Marathon 2026", channels } = body;

    const validEvents: NotificationEventType[] = [
      "REGISTRATION_CONFIRMED",
      "PAYMENT_SUCCESSFUL",
      "BIB_ISSUED",
      "RACE_REMINDER",
      "SHIPPING_UPDATED",
      "EVENT_CANCELLED",
      "TRANSFER_COMPLETED",
      "RESULTS_PUBLISHED",
      "CERTIFICATE_AVAILABLE",
    ];

    const type: NotificationEventType = validEvents.includes(eventType)
      ? eventType
      : "REGISTRATION_CONFIRMED";

    let dispatchResults: any[] = [];

    switch (type) {
      case "REGISTRATION_CONFIRMED":
        dispatchResults = await NotificationService.notifyRegistrationConfirmed(
          session.user.id,
          eventTitle,
          "Half Marathon 21.1 KM"
        );
        break;

      case "PAYMENT_SUCCESSFUL":
        dispatchResults = await NotificationService.notifyPaymentSuccessful(
          session.user.id,
          eventTitle,
          650,
          "1088"
        );
        break;

      case "BIB_ISSUED":
        dispatchResults = await NotificationService.notifyBibIssued(
          session.user.id,
          eventTitle,
          "1088",
          "NP-TIMING-1088",
          "CORRAL A"
        );
        break;

      case "RACE_REMINDER":
        dispatchResults = await NotificationService.notifyRaceReminder(
          session.user.id,
          eventTitle,
          "อาทิตย์ที่ 15 พฤศจิกายน 2569 เวลา 04:30 น.",
          "องค์พระปฐมเจดีย์ จ.นครปฐม"
        );
        break;

      case "SHIPPING_UPDATED":
        dispatchResults = await NotificationService.notifyShippingUpdated(
          session.user.id,
          eventTitle,
          "1088",
          "TH8294719283NP"
        );
        break;

      case "EVENT_CANCELLED":
        dispatchResults = await NotificationService.notifyEventCancelled(
          session.user.id,
          eventTitle,
          650
        );
        break;

      case "TRANSFER_COMPLETED":
        dispatchResults = await NotificationService.notifyTransferCompleted(
          session.user.id,
          eventTitle,
          "1088",
          "ธนภัทร รุ่งเรือง"
        );
        break;

      case "RESULTS_PUBLISHED":
        dispatchResults = await NotificationService.notifyResultsPublished(
          session.user.id,
          eventTitle,
          "1088",
          "00:54:12",
          "3 (Overall)"
        );
        break;

      case "CERTIFICATE_AVAILABLE":
        dispatchResults = await NotificationService.notifyCertificateAvailable(
          session.user.id,
          eventTitle,
          "1088"
        );
        break;
    }

    return apiSuccess({
      message: `ส่งการแจ้งเตือนประเภท "${type}" ข้าม 4 ช่องทาง (Email, SMS, Web Push, In-App) สำเร็จแล้ว`,
      eventType: type,
      dispatchResults,
    });
  } catch (error: any) {
    console.error("Failed to test trigger notification:", error);
    return apiError("INTERNAL_SERVER_ERROR", error.message || "Failed to trigger notification", 500);
  }
}
