// app/admin/results/page.js
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ManageResults from "@/components/ManageResults";
import ResultsTable from "@/components/ResultsTable";

const AdminResultsPage = () => {
  const [examResults, setExamResults] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCommunity, setSelectedCommunity] = useState("All")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExamResults()
  }, [])

  const fetchExamResults = async () => {
    setIsLoading(true) // Set loading to true before fetching
    try {
      const response = await axios.get("/api/exam-result")
      setExamResults(response.data)
    } catch (error) {
      console.error("Error fetching exam results:", error)
      alert("Failed to load exam results.")
    } finally {
      setIsLoading(false) // Set loading to false after fetching (success or error)
    }
  }

  const sortedResults = useMemo(() => {
    const sortableResults = [...examResults]
    if (sortConfig.key !== null) {
      sortableResults.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableResults
  }, [examResults, sortConfig])

  const filteredResults = useMemo(() => {
    return sortedResults.filter(
      (result) =>
        (selectedCommunity === "All" || result.community === selectedCommunity) &&
        Object.values(result).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [sortedResults, searchTerm, selectedCommunity])

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const communities = useMemo(() => {
    return ["All", ...new Set(examResults.map((result) => result.community))]
  }, [examResults])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="results">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="manage">Manage Results</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
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
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Loading exam results...
                </div>
              ) : (
                <div className="rounded-md border">
                  <ResultsTable examResults={filteredResults} requestSort={requestSort} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="manage">
              <ManageResults />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminResultsPage