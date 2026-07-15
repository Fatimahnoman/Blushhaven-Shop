import { motion } from "framer-motion";
import {
  Check,
  Package,
  Truck,
  MapPin,
  PartyPopper,
  Clock,
  X as XIcon,
} from "lucide-react";
import { useState } from "react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type Step = {
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    key: "pending",
    label: "Order Placed",
    description: "We've received your order",
    icon: <Package className="w-4 h-4" />,
  },
  {
    key: "processing",
    label: "Processing",
    description: "Your order is being prepared",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Package is on its way",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    key: "delivered",
    label: "Out for Delivery",
    description: "Arriving today",
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Package delivered",
    icon: <PartyPopper className="w-4 h-4" />,
  },
];

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "delivered",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

function ConfettiParticle({ index }: { index: number }) {
  const colors = ["bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-blue-400", "bg-purple-400", "bg-pink-400"];
  const color = colors[index % colors.length];
  const x = (Math.random() - 0.5) * 120;
  const y = -(Math.random() * 60 + 30);
  const rotate = Math.random() * 360;
  const size = Math.random() * 6 + 4;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        x,
        y: [y, y + 80],
        rotate,
        scale: [1, 0.5],
      }}
      transition={{ duration: 1.2 + Math.random() * 0.5, ease: "easeOut" }}
      className={`absolute ${color} rounded-full`}
      style={{ width: size, height: size, top: "50%", left: "50%" }}
    />
  );
}

export function OrderTracking({
  orderId,
  status,
  createdAt,
}: {
  orderId: string;
  status: OrderStatus;
  createdAt: string;
}) {
  const [showMap, setShowMap] = useState(false);

  if (status === "cancelled") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto p-6 rounded-3xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <XIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Order Cancelled
            </h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Order {orderId}
            </p>
          </div>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          This order was cancelled on {createdAt}. If you were charged, a refund will be processed within 3-5 business days.
        </p>
      </motion.div>
    );
  }

  const activeIndex = STATUS_ORDER.indexOf(status);
  const progressPercent = activeIndex >= 0 ? (activeIndex / (STEPS.length - 1)) * 100 : 0;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (status === "delivered" ? 0 : 3));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto rounded-3xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Order Tracking
            </h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">
              {orderId}
            </p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${STATUS_COLORS[status]}`}>
            {status}
          </span>
        </div>

        <div className="relative ml-4">
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-neutral-100 dark:bg-neutral-800" />

          <motion.div
            className="absolute left-[11px] top-0 w-0.5 bg-gradient-to-b from-rose-500 to-purple-500 origin-top"
            initial={{ height: "0%" }}
            animate={{ height: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />

          <div className="space-y-6">
            {STEPS.map((step, index) => {
              const isCompleted = index < activeIndex;
              const isActive = index === activeIndex;
              const isPending = index > activeIndex;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * index + 0.3, duration: 0.4 }}
                  className="relative flex items-start gap-4"
                >
                  <div
                    className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-br from-rose-500 to-purple-500 text-white"
                        : isActive
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 ring-4 ring-neutral-100 dark:ring-neutral-800"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isPending
                            ? "text-neutral-300 dark:text-neutral-600"
                            : "text-neutral-900 dark:text-neutral-100"
                        }`}
                      >
                        {step.label}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-500 font-medium">
                          Done
                        </span>
                      )}
                      {isActive && (
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-rose-500"
                        />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isPending
                          ? "text-neutral-200 dark:text-neutral-700"
                          : "text-neutral-400 dark:text-neutral-500"
                      }`}
                    >
                      {step.description}
                    </p>
                    {(isCompleted || isActive) && (
                      <p className="text-[11px] text-neutral-300 dark:text-neutral-600 mt-1">
                        {isCompleted ? "Completed" : "In progress"}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {status === "delivered" && (
        <div className="relative px-6 pb-6 overflow-hidden">
          <div className="relative">
            {Array.from({ length: 20 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>
        </div>
      )}

      {status !== "delivered" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="px-6 pb-6"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Estimated delivery
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {estimatedDelivery.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-700 shadow-sm flex items-center justify-center">
                <Truck className="w-5 h-5 text-neutral-400 dark:text-neutral-300" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {(status === "shipped" || status === "delivered") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="px-6 pb-6"
        >
          <button
            onClick={() => setShowMap((s) => !s)}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-rose-50 dark:from-purple-900/20 dark:to-rose-900/20 border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-shadow"
          >
            <div className="relative h-24 rounded-xl bg-gradient-to-br from-purple-100/50 to-rose-100/50 dark:from-purple-800/20 dark:to-rose-800/20 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-purple-300 dark:bg-purple-600"
                    style={{
                      width: 60 + Math.random() * 100,
                      height: 60 + Math.random() * 100,
                      top: `${Math.random() * 80}%`,
                      left: `${Math.random() * 80}%`,
                    }}
                  />
                ))}
              </div>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <div className="absolute bottom-2 right-3 text-[10px] font-medium text-purple-400 dark:text-purple-300 bg-white/80 dark:bg-neutral-900/80 px-2 py-0.5 rounded-full">
                Live tracking
              </div>
            </div>
          </button>
        </motion.div>
      )}

      {(status === "shipped" || status === "delivered") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="px-6 pb-6"
        >
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium mb-2">
              Carrier Information
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Express Shipping
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Tracking: BH-{orderId.replace("#", "")}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                On Time
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="px-6 pb-6">
        <p className="text-[11px] text-center text-neutral-300 dark:text-neutral-600">
          Placed on {createdAt}
        </p>
      </div>
    </motion.div>
  );
}
