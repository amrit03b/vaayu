"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { getStoredWallet } from "@/lib/aptos"
import { isCivicAuthenticated } from "@/lib/civic"
import { submitProfileTransaction, type HealthProfile } from "@/lib/aptos"
import { ArrowLeft, Loader2, CheckCircle, User, Heart, MapPin, Clock } from "lucide-react"
import Link from "next/link"

const CHRONIC_CONDITIONS = [
  "Asthma",
  "Diabetes Type 1",
  "Diabetes Type 2",
  "COPD",
  "Heart Disease",
  "Allergies",
  "Hypertension",
  "Other",
]

const WALK_TIMES = [
  "Early Morning (5-7 AM)",
  "Morning (7-10 AM)",
  "Late Morning (10 AM-12 PM)",
  "Afternoon (12-3 PM)",
  "Late Afternoon (3-6 PM)",
  "Evening (6-8 PM)",
  "Night (8-10 PM)",
]

const SENSITIVITY_LEVELS = [
  "Low - I rarely notice air quality changes",
  "Moderate - I sometimes feel effects of poor air quality",
  "High - I often experience symptoms from air pollution",
  "Very High - I am very sensitive to air quality changes",
]

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [transactionHash, setTransactionHash] = useState<string>("")

  const router = useRouter()
  const wallet = getStoredWallet()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    chronicConditions: [] as string[],
    preferredWalkTime: "",
    pollutionSensitivity: "",
    location: "",
  })

  useEffect(() => {
    // Check authentication
    if (!isCivicAuthenticated() || !wallet) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router, wallet])

  useEffect(() => {
    // Calculate progress based on filled fields
    const fields = [
      formData.name,
      formData.age,
      formData.gender,
      formData.chronicConditions.length > 0,
      formData.preferredWalkTime,
      formData.pollutionSensitivity,
      formData.location,
    ]
    const filledFields = fields.filter(Boolean).length
    setProgress((filledFields / fields.length) * 100)
  }, [formData])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: checked
        ? [...prev.chronicConditions, condition]
        : prev.chronicConditions.filter((c) => c !== condition),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) {
      setError("No wallet found. Please log in again.")
      return
    }

    // Validate required fields
    if (
      !formData.name ||
      !formData.age ||
      !formData.gender ||
      formData.chronicConditions.length === 0 ||
      !formData.location
    ) {
      setError("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const profileData: HealthProfile = {
        name: formData.name,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        chronicCondition: formData.chronicConditions,
        preferredWalkTime: formData.preferredWalkTime,
        pollutionSensitivity: formData.pollutionSensitivity,
        location: formData.location,
      }

      const result = await submitProfileTransaction(wallet, profileData)

      if (result.success) {
        setTransactionHash(result.transactionHash || "")
        setSubmitted(true)
      } else {
        setError(result.error || "Failed to submit profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Profile Submitted Successfully!</CardTitle>
            <CardDescription>Your health profile has been securely stored on the Aptos blockchain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactionHash && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
                <code className="text-xs font-mono break-all">{transactionHash}</code>
              </div>
            )}
            <Link href="/dashboard">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Profile Setup</h1>
              <p className="text-gray-600">Help us personalize your environmental health recommendations</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>This information will be securely stored on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Enter your age"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Health Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <Label className="text-base font-medium">Chronic Conditions *</Label>
                  </div>
                  <p className="text-sm text-gray-600">Select all conditions that apply to you</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CHRONIC_CONDITIONS.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={formData.chronicConditions.includes(condition)}
                          onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                        />
                        <Label htmlFor={condition} className="text-sm">
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <Label className="text-base font-medium">Walking Preferences</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="walkTime">Preferred Walk Time</Label>
                    <Select
                      value={formData.preferredWalkTime}
                      onValueChange={(value) => handleInputChange("preferredWalkTime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="When do you prefer to walk?" />
                      </SelectTrigger>
                      <SelectContent>
                        {WALK_TIMES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sensitivity">Pollution Sensitivity</Label>
                    <Select
                      value={formData.pollutionSensitivity}
                      onValueChange={(value) => handleInputChange("pollutionSensitivity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How sensitive are you to air pollution?" />
                      </SelectTrigger>
                      <SelectContent>
                        {SENSITIVITY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <Label htmlFor="location">Location *</Label>
                  </div>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter your city and state/country"
                    required
                  />
                  <p className="text-xs text-gray-500">This helps us provide location-specific air quality data</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Save as Draft
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting || progress < 100} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting to Blockchain...
                      </>
                    ) : (
                      "Submit Profile"
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Your data will be encrypted and stored securely on the Aptos blockchain
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
