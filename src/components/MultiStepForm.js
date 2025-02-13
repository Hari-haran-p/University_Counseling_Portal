"use client"

// import type React from "react"
import { useState } from "react"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const steps = ["Personal Details", "Educational Details", "Photo & Acknowledgement"]

export function MultiStepForm() {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({
        personalDetails: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
        },
        educationalDetails: {
            highestQualification: "",
            institution: "",
            yearOfPassing: "",
            gpa: "",
        },
        photoAndAcknowledgement: {
            photo: null,
            acknowledgement: false,
        },
    })

    const handleInputChange = (
        section,
        field,
        value
    ) => {
        setFormData((prevData) => ({
            ...prevData,
            [section]: {
                ...prevData[section],
                [field]: value,
            },
        }));
    };


    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prevStep) => prevStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prevStep) => prevStep - 1)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Form submitted:", formData)
        // Here you would typically send the data to your backend
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.personalDetails.firstName}
                                        onChange={(e) => handleInputChange("personalDetails", "firstName", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.personalDetails.lastName}
                                        onChange={(e) => handleInputChange("personalDetails", "lastName", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.personalDetails.email}
                                    onChange={(e) => handleInputChange("personalDetails", "email", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.personalDetails.phone}
                                    onChange={(e) => handleInputChange("personalDetails", "phone", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </>
                )
            case 1:
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Educational Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="highestQualification">Highest Qualification</Label>
                                <Input
                                    id="highestQualification"
                                    value={formData.educationalDetails.highestQualification}
                                    onChange={(e) => handleInputChange("educationalDetails", "highestQualification", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution</Label>
                                <Input
                                    id="institution"
                                    value={formData.educationalDetails.institution}
                                    onChange={(e) => handleInputChange("educationalDetails", "institution", e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="yearOfPassing">Year of Passing</Label>
                                    <Input
                                        id="yearOfPassing"
                                        type="number"
                                        value={formData.educationalDetails.yearOfPassing}
                                        onChange={(e) => handleInputChange("educationalDetails", "yearOfPassing", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gpa">GPA</Label>
                                    <Input
                                        id="gpa"
                                        type="number"
                                        step="0.01"
                                        value={formData.educationalDetails.gpa}
                                        onChange={(e) => handleInputChange("educationalDetails", "gpa", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </>
                )
            case 2:
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Photo & Acknowledgement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="photo">Upload Photo</Label>
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleInputChange("photoAndAcknowledgement", "photo", e.target.files?.[0] || null)}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="acknowledgement"
                                    checked={formData.photoAndAcknowledgement.acknowledgement}
                                    onCheckedChange={(checked) =>
                                        handleInputChange("photoAndAcknowledgement", "acknowledgement", checked)
                                    }
                                />
                                <Label htmlFor="acknowledgement">
                                    I acknowledge that all the information provided is accurate and complete.
                                </Label>
                            </div>
                        </CardContent>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <Card className="mt-8">
                <CardHeader>
                    {console.log(Stepper)
                    }
                    <Stepper steps={steps} currentStep={currentStep} className="mb-8" />
                </CardHeader>
                {renderStepContent()}
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                        Previous
                    </Button>
                    {currentStep === steps.length - 1 ? (
                        <Button type="submit" className="bg-primary-800">Submit</Button>
                    ) : (
                        <Button type="button" className="bg-primary-800" onClick={handleNext}>
                            Save & Next
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </form>
    )
}

