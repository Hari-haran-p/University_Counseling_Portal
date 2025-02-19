// app/results/page.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Search, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const UserResultsPage = () => {
    const [examResults, setExamResults] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [resultDatePassed, setResultDatePassed] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [examResultsResponse, datesResponse] = await Promise.all([
                axios.get("/api/exam-result"),
                axios.get("/api/get-dates"),
            ]);

            setExamResults(examResultsResponse.data);
            console.log(examResultsResponse.data);

            if (datesResponse.data && datesResponse.data.length > 0) {
                const resultDate = parseISO(datesResponse.data[0].result_date);
                setResultDatePassed(new Date() >= resultDate);
            } else {
                console.warn("No result date found.");
                setResultDatePassed(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load data.");
        } finally {
            setIsLoading(false);
        }
    };

    const sortedResults = useMemo(() => {
        const sortableResults = [...examResults];
        if (sortConfig.key !== null) {
            sortableResults.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableResults;
    }, [examResults, sortConfig]);

    const filteredResults = useMemo(() => {
        return sortedResults.filter(
            (result) =>
                (selectedCommunity === "All" || result.community === selectedCommunity) &&
                Object.values(result)
                    .some((value) =>
                        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                    )
        );
    }, [sortedResults, searchTerm, selectedCommunity]);

    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const communities = useMemo(() => {
        return ["All", ...new Set(examResults.map((result) => result.community))];
    }, [examResults]);

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Exam Results</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Loading exam results...
                        </div>
                    ) : !resultDatePassed ? (
                        <div className="text-center">
                            Results will be published on a later date.
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-2">
                                    <Search className="text-gray-400" />
                                    <Input
                                        placeholder="Search results..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                </div>
                                <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Community" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {communities.map((community) => (
                                            <SelectItem key={community} value={community}>
                                                {community}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {["User ID", "User Name", "Score", "Community", "Overall Rank", "Community Rank"].map(
                                                (header) => (
                                                    <TableHead key={header} className="font-bold">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => requestSort(header.toLowerCase().replace(" ", "_"))}
                                                            className="hover:bg-transparent"
                                                        >
                                                            {header}
                                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </TableHead>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredResults.map((result) => (
                                            <TableRow key={result.user_id}>
                                                <TableCell>{result.user_id}</TableCell>
                                                <TableCell className="font-medium">{result.name}</TableCell>
                                                <TableCell>{result.score}</TableCell>
                                                <TableCell>{result.community}</TableCell>
                                                <TableCell>{result.overall_rank}</TableCell>
                                                <TableCell>{result.community_rank}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserResultsPage;