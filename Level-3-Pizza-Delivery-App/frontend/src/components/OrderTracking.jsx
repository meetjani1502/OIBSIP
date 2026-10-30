import { Check, Package, ChefHat, Bike, Home } from "lucide-react";

const steps = [
  { status: "pending", label: "Order Placed", icon: Package },
  { status: "confirmed", label: "Confirmed", icon: Check },
  { status: "preparing", label: "Preparing", icon: ChefHat },
  { status: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { status: "delivered", label: "Delivered", icon: Home },
];

function OrderTracking({ status }) {
  const currentIndex = steps.findIndex((step) => step.status === status);

  if (status === "cancelled") {
    return (
      <div className="tracking-cancelled">
        <strong>Order Cancelled</strong>
      </div>
    );
  }

  return (
    <div className="tracking-timeline">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const completed = index <= currentIndex;

        return (
          <div
            className={`tracking-step ${completed ? "completed" : ""}`}
            key={step.status}
          >
            <div className="tracking-icon">
              <Icon size={18} />
            </div>

            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default OrderTracking;
