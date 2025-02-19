"use client";

import { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

export function DeclarationDetails({ formData, setFormData }) {
  
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState(null);
  const [originalSignatureUrl, setOriginalSignatureUrl] = useState(null);

  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        const response = await axios.get("/api/declarationDetails");
        setFormData((prevData) => ({
          ...prevData,
          existingPhotoUrl: response.data.photoUrl,
          existingSignatureUrl: response.data.signatureUrl,
          declaration: response.data.declaration,
        }));
        setOriginalPhotoUrl(response.data.photoUrl);
        setOriginalSignatureUrl(response.data.signatureUrl);
      } catch (error) {
        console.error("Error fetching existing images:", error);
      }
    };
    fetchExistingImages();
  }, []);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setFormData((prevData) => {
      if (type === "photo") {
        return {
          ...prevData,
          photo: file,
          photoPreview: URL.createObjectURL(file),
        };
      } else {
        return {
          ...prevData,
          signature: file,
          signaturePreview: URL.createObjectURL(file),
        };
      }
    });
  };

  const handleDeclarationChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      declaration: e.target.checked,
    }));
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Documents & Declaration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="photo">Passport Size Photo</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "photo")}
          />
          <p className="text-sm text-muted-foreground">
            Upload a recent passport size photograph
          </p>
          {formData.photoPreview ? (
            <img
              src={formData.photoPreview}
              alt="Photo Preview"
              className="max-h-40 rounded-md"
            />
          ) : formData.existingPhotoUrl ? (
            <img
              src={formData.existingPhotoUrl}
              alt="Existing Photo"
              className="max-h-40 rounded-md"
            />
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signature">Signature</Label>
          <Input
            id="signature"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "signature")}
          />
          <p className="text-sm text-muted-foreground">
            Upload a scanned copy of your signature
          </p>
          {formData.signaturePreview ? (
            <img
              src={formData.signaturePreview}
              alt="Signature Preview"
              className="max-h-40 rounded-md"
            />
          ) : formData.existingSignatureUrl ? (
            <img
              src={formData.existingSignatureUrl}
              alt="Existing Signature"
              className="max-h-40 rounded-md"
            />
          ) : null}
        </div>
        <div className="space-y-4 rounded-lg border p-4">
          <p className="text-sm">
            I hereby declare that all the information provided by me in this
            application is true and correct to the best of my knowledge and
            belief. I understand that any false information may result in the
            cancellation of my application.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="declaration"
              className="h-4 w-4 rounded border-gray-300"
              checked={formData.declaration || false}
              onChange={handleDeclarationChange}
            />
            <Label htmlFor="declaration">
              I agree to the above declaration
            </Label>
          </div>
        </div>
      </CardContent>
    </>
  );
}