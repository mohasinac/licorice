"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, PaymentMethod } from "@/lib/types";
import type { ShippingMode } from "@/constants/policies";

export type CheckoutStep = "cart" | "address" | "shipping" | "payment" | "confirm";

export type { ShippingMode };

interface CheckoutState {
  step: CheckoutStep;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMode: ShippingMode;
  paymentMethod: PaymentMethod;
  couponCode: string;
  discount: number;
  freeShipping: boolean;
  customerNote: string;
  // Placed order info
  orderId: string | null;
  orderNumber: string | null;

  setStep: (step: CheckoutStep) => void;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setShippingMode: (mode: ShippingMode) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  applyDiscount: (code: string, amount: number, freeShipping?: boolean) => void;
  removeDiscount: () => void;
  setCustomerNote: (note: string) => void;
  setOrderPlaced: (orderId: string, orderNumber: string) => void;
  reset: () => void;
}

const defaults = {
  step: "cart" as CheckoutStep,
  shippingAddress: null,
  billingAddress: null,
  shippingMode: "standard" as ShippingMode,
  paymentMethod: "whatsapp" as PaymentMethod,
  couponCode: "",
  discount: 0,
  freeShipping: false,
  customerNote: "",
  orderId: null,
  orderNumber: null,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...defaults,
      setStep: (step) => set({ step }),
      setShippingAddress: (shippingAddress) => set({ shippingAddress }),
      setBillingAddress: (billingAddress) => set({ billingAddress }),
      setShippingMode: (shippingMode) => set({ shippingMode }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      applyDiscount: (couponCode, discount, freeShipping = false) =>
        set({ couponCode, discount, freeShipping }),
      removeDiscount: () => set({ couponCode: "", discount: 0, freeShipping: false }),
      setCustomerNote: (customerNote) => set({ customerNote }),
      setOrderPlaced: (orderId, orderNumber) => set({ orderId, orderNumber, step: "confirm" }),
      reset: () => set(defaults),
    }),
    {
      name: "licorice-checkout",
      partialize: (state) => ({
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        shippingMode: state.shippingMode,
        paymentMethod: state.paymentMethod,
        couponCode: state.couponCode,
        discount: state.discount,
        freeShipping: state.freeShipping,
      }),
    },
  ),
);
