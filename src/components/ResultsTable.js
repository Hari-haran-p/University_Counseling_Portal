// app/admin/results/components/ResultsTable.jsx
"use client";

import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const ResultsTable = ({ examResults }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

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

    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    return (
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
                {sortedResults.map((result) => (
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
    );
};

export default ResultsTable;