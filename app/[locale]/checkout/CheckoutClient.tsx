"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import toast from "react-hot-toast";
import { useCartStore } from "@/stores/useCartStore";
import { useCheckoutStore } from "@/stores/useCheckoutStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { AddressList } from "@/components/checkout/AddressList";
import { ShippingOptions, getShippingCharge } from "@/components/checkout/ShippingOptions";
import { PaymentOptions } from "@/components/checkout/PaymentOptions";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { WhatsAppPaymentInstructions } from "@/components/checkout/WhatsAppPaymentInstructions";
import { WhatsAppProofUpload } from "@/components/checkout/WhatsAppProofUpload";
import { CouponInput } from "@/components/cart/CouponInput";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/lib/actions/createOrder";
import type { Address, PaymentSettings } from "@/lib/types";
import { COD_FEE } from "@/constants/policies";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface CheckoutClientProps {
  paymentSettings: PaymentSettings;
}

export function CheckoutClient({ paymentSettings }: CheckoutClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, subtotal, itemCount, clear } = useCartStore();
  const {
    step,
    setStep,
    shippingAddress,
    setShippingAddress,
    shippingMode,
    setShippingMode,
    paymentMethod,
    setPaymentMethod,
    couponCode,
    discount,
    freeShipping,
    applyDiscount,
    removeDiscount,
    orderId,
    orderNumber,
    setOrderPlaced,
    reset,
  } = useCheckoutStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [placing, setPlacing] = useState(false);

  const sub = subtotal();
  const shipping = freeShipping ? 0 : getShippingCharge(shippingMode, sub - discount);
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!user) return;
    async function loadAddresses() {
      try {
        const { getClientAuth } = await import("@/lib/firebase/client");
        const token = await getClientAuth().currentUser?.getIdToken();
        const res = await fetch("/api/account/addresses", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        const addrs = data.addresses ?? [];
        setAddresses(addrs);
        if (addrs.length > 0 && !shippingAddress) {
          setShippingAddress(addrs[0]);
        }
      } catch {
        /* ignore */
      }
    }
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAddNewAddress(address: Address) {
    setAddresses((prev) => [...prev, address]);
    setShippingAddress(address);
    if (user) {
      try {
        const { getClientAuth } = await import("@/lib/firebase/client");
        const token = await getClientAuth().currentUser?.getIdToken();
        await fetch("/api/account/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(address),
        });
      } catch {
        /* non-fatal */
      }
    }
  }

  async function handlePlaceOrder() {
    if (!shippingAddress) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (itemCount() === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setPlacing(true);
    try {
      const guestEmail = !user ? undefined : undefined; // require login or handle guest
      const result = await createOrder({
        userId: user?.uid,
        guestEmail,
        items: items,
        shippingAddress,
        shippingMode,
        paymentMethod,
        couponCode: couponCode || undefined,
        discount,
        freeShipping,
        customerNote: "",
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setOrderPlaced(result.orderId, result.orderNumber);
      clear();
      reset();
      // navigate to confirmation stays on same page (step = confirm)
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  // ── Post-order confirmation step ──────────────────────────────────────────
  if (step === "confirm" && orderId && orderNumber) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-heading text-foreground mb-2 text-3xl font-bold">Order Placed!</h1>
          <p className="text-muted-foreground">Order #{orderNumber}</p>
        </div>

        {paymentMethod === "whatsapp" && (
          <WhatsAppPaymentInstructions
            orderNumber={orderNumber}
            total={sub - discount + shipping + codFee}
            settings={paymentSettings}
          />
        )}

        {paymentMethod === "whatsapp" && (
          <div className="mt-6">
            <WhatsAppProofUpload orderId={orderId} />
          </div>
        )}

        {(paymentMethod === "cod" || paymentMethod === "razorpay") && (
          <div className="border-border rounded-xl border p-6 text-left">
            <p className="text-muted-foreground text-sm">
              {paymentMethod === "cod"
                ? "Your order is confirmed. Pay ₹" +
                  fmt(sub - discount + shipping + codFee) +
                  " when it arrives at your door."
                : "Payment completed. Your order is confirmed!"}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push(`/${locale}/account/orders`)} variant="outline">
            View My Orders
          </Button>
          <Button onClick={() => router.push(`/${locale}/shop`)}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">Checkout</h1>
      <CheckoutStepper currentStep={step} onStepClick={setStep} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Step: Cart review */}
          {step === "cart" && (
            <section>
              <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">Your Cart</h2>
              {itemCount() === 0 ? (
                <p className="text-muted-foreground">
                  Your cart is empty.{" "}
                  <a href={`/${locale}/shop`} className="text-primary underline">
                    Shop now
                  </a>
                </p>
              ) : (
                <>
                  <ul className="divide-border divide-y">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </ul>
                  <div className="border-border mt-4 rounded-xl border p-4">
                    <p className="text-foreground mb-3 text-sm font-medium">Have a coupon?</p>
                    <CouponInput
                      cartTotal={sub}
                      userId={user?.uid}
                      cartItems={items.map((i) => ({ productId: i.productId, category: "" }))}
                      appliedCode={couponCode || undefined}
                      onApplied={(code, amount) => applyDiscount(code, amount)}
                      onRemoved={removeDiscount}
                    />
                  </div>
                  <div className="mt-6">
                    <Button onClick={() => setStep("address")} className="w-full" size="lg">
                      Continue to Address →
                    </Button>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Step: Address */}
          {step === "address" && (
            <section>
              <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">
                Delivery Address
              </h2>
              <AddressList
                addresses={addresses}
                selectedAddress={shippingAddress}
                onSelect={setShippingAddress}
                onAddNew={handleAddNewAddress}
              />
              {shippingAddress && (
                <Button onClick={() => setStep("shipping")} className="mt-6 w-full" size="lg">
                  Continue to Shipping →
                </Button>
              )}
            </section>
          )}

          {/* Step: Shipping */}
          {step === "shipping" && (
            <section>
              <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">
                Shipping Method
              </h2>
              <ShippingOptions
                subtotal={sub - discount}
                selected={shippingMode}
                onChange={setShippingMode}
              />
              <Button onClick={() => setStep("payment")} className="mt-6 w-full" size="lg">
                Continue to Payment →
              </Button>
            </section>
          )}

          {/* Step: Payment */}
          {step === "payment" && (
            <section>
              <h2 className="font-heading text-foreground mb-4 text-xl font-semibold">
                Payment Method
              </h2>
              <PaymentOptions
                settings={paymentSettings}
                selected={paymentMethod}
                onChange={setPaymentMethod}
              />
              <Button
                onClick={handlePlaceOrder}
                loading={placing}
                className="mt-6 w-full"
                size="lg"
              >
                Place Order — {fmt(sub - discount + shipping + codFee)}
              </Button>
              <p className="text-muted-foreground mt-3 text-center text-xs">
                By placing your order you agree to our{" "}
                <a href={`/${locale}/terms`} className="text-primary underline">
                  Terms of Service
                </a>
                .
              </p>
            </section>
          )}
        </div>

        {/* Sidebar: Order summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={items}
            subtotal={sub}
            discount={discount}
            couponCode={couponCode || undefined}
            shippingMode={shippingMode}
            isCod={paymentMethod === "cod"}
            isFreeShipping={freeShipping}
            locale={locale}
          />
          {step !== "cart" && (
            <button
              onClick={() => setStep("cart")}
              className="text-primary mt-3 block w-full text-center text-sm underline"
            >
              ← Edit Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
