// app/counseling/page.js
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvailableSeats from "@/components/AvailableSeats";
import StudentPreferences from "@/components/StudentPreferences";
import CounselingResultsPage from "@/components/CounselingResults";

const CounselingPage = () => {
    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Counselling
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="available-seats" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="available-seats">Available Seats</TabsTrigger>
                            <TabsTrigger value="preferences">Preferences</TabsTrigger>
                            <TabsTrigger value="results">Results</TabsTrigger>
                        </TabsList>
                        <TabsContent value="available-seats">
                            <AvailableSeats />
                        </TabsContent>
                        <TabsContent value="preferences">
                            <StudentPreferences />
                        </TabsContent>
                        <TabsContent value="results">
                            <CounselingResultsPage />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CounselingPage;