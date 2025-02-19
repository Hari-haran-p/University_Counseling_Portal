// src/components/payment-details/PaymentDetails.jsx
"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export function PaymentDetails() {
    return (
        <>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border p-8 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Application Fee</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Amount: ₹1000</p>
                    <Button className="mt-4">Proceed to Payment</Button>
                </div>
            </CardContent>
        </>
    );
}