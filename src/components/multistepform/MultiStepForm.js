// MultiStepForm.jsx

"use client";

import { useState, useCallback } from "react";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersonalDetails } from "@/components/multistepform/steps/PersonalDetails";
import { EducationalDetails } from "@/components/multistepform/steps/EducationalDetails";
import { PaymentDetails } from "@/components/multistepform/steps/PaymentDetails";
import { DeclarationDetails } from "@/components/multistepform/steps/DeclarationDetails";
import { savePersonalDetailsData } from "@/services/personalDetailsService";
import { saveEducationalDetailsData } from "@/services/educationalDetailsService";
import { uploadFiles } from "@/services/declarationDetailsService";
import { useRouter } from "next/navigation";

const steps = [
  "Personal Details",
  "Educational Details",
  "Payment",
  "Declaration",
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: null,
    gender: "male",
    religion: "",
    parent_name: "",
    parent_mobno: "",
    address1: "",
    address2: "",
    pincode: "",
    state: "",
    city: "",
    board_name: "",
    school_name: "",
    month_passout: "",
    year_passout: "",
    address: "",
    mobno: "",
    community: "",
    mother_tongue: "",
    native_state: "",
    district: "",
    medium: "",
    photo: null,
    signature: null,
    declaration: false,
    photoPreview: null,
    signaturePreview: null,
    existingPhotoUrl: null,
    existingSignatureUrl: null,
  });

  const router = useRouter();

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalDetails formData={formData} setFormData={setFormData} />
        );
      case 1:
        return (
          <EducationalDetails formData={formData} setFormData={setFormData} />
        );
      case 2:
        return <PaymentDetails formData={formData} setFormData={setFormData} />;
      case 3:
        return (
          <DeclarationDetails formData={formData} setFormData={setFormData} />
        );
      default:
        return null;
    }
  }, [currentStep, formData, setFormData]);

  const handleNext = async () => {
    try {
      setIsLoading(true);

      let response;
      if (currentStep === 0) {
        response = await savePersonalDetailsData(formData);
      } else if (currentStep === 1) {
        response = await saveEducationalDetailsData(formData);
      } else if (currentStep === 2) {
        response = { status: 200 };
      } else if (currentStep === 3) {
        response = { status: 200 };
      }

      if (response?.status === 200) {
        toast.success("Data saved successfully!");
      } else {
        toast.error(
          response?.data?.message || "Failed to save data. Please try again."
        );
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error saving form data:", error);
      toast.error(error.message || "An error occurred while saving data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const uploadResponse = await uploadFiles(
        formData.photo,
        formData.signature,
        formData.declaration,
        formData.existingPhotoUrl,
        formData.existingSignatureUrl
      );

      if (uploadResponse.status === 200) {
        toast.success("Files uploaded successfully!");
        router.push("/");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("An error occurred during form submission.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="border-b">
          <div className="mb-12">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
          <div className="flex flex-col w-full justify-between items-start">
            <div className="flex items-center justify-between w-full mb-2">
              <h2 className="text-sm">Application Form</h2>
              <p className="text-sm text-muted-foreground">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </p>
            </div>
            <Progress
              value={((currentStep + 1) / steps.length) * 100}
              className="h-2 w-full"
            />
          </div>
        </CardHeader>
        {renderStepContent()}
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isLoading}>
              Submit
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isLoading}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}