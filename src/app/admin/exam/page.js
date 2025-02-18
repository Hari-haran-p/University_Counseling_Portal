"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Trash2, Eye, Calendar, Loader2 } from "lucide-react" // Added Loader2
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddQuestionForm } from "@/components/AddQuestionForm"
import { BulkUpload } from "@/components/BulkUpload"
import { QuestionDetails } from "@/components/QuestionDetails"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([])
  const [examSchedules, setExamSchedules] = useState([])
  const [newSchedule, setNewSchedule] = useState({
    exam_name: "",
    start_time: "",
    end_time: "",
  })
  const [isLoading, setIsLoading] = useState(true) // Added loading state

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true) // Set loading to true before fetching
    try {
      // Fetch questions and exam schedules in parallel
      await Promise.all([fetchQuestions(), fetchExamSchedules()])
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Failed to load data. Please try again.")
    } finally {
      setIsLoading(false) // Set loading to false after fetching (success or error)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("/api/questions")
      setQuestions(response.data)
    } catch (error) {
      console.error("Error fetching questions:", error)
      alert("Failed to load questions.")
    }
  }

  const fetchExamSchedules = async () => {
    try {
      const response = await axios.get("/api/exam-schedules")
      setExamSchedules(response.data)
    } catch (error) {
      console.error("Error fetching exam schedules:", error)
      alert("Failed to load exam schedules.")
    }
  }

  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target
    setNewSchedule({ ...newSchedule, [name]: value })
  }

  const addExamSchedule = async () => {
    try {
      const response = await axios.post("/api/exam-schedules", {
        exam_name: newSchedule.exam_name,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
      })
      if (response.status === 201) {
        alert("Exam schedule added successfully!")
        setNewSchedule({
          exam_name: "",
          start_time: "",
          end_time: "",
        })
        fetchExamSchedules()
      }
    } catch (error) {
      console.error("Error adding exam schedule:", error)
      alert("Failed to add exam schedule.")
    }
  }

  const deleteExamSchedule = async (id) => {
    try {
      await axios.delete(`/api/exam-schedules/${id}`)
      fetchExamSchedules()
    } catch (error) {
      console.error("Error deleting exam schedule:", error)
      alert("Failed to delete exam schedule.")
    }
  }

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`/api/questions/${id}`)
      fetchQuestions()
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Failed to delete question.")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Exam Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-4">
              {/* Added col-4 */}
              <TabsTrigger value="list">Question List</TabsTrigger>
              <TabsTrigger value="add">Add Question</TabsTrigger>
              <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
              <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
              {/* Added schedule tab */}
            </TabsList>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <TabsContent value="list">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question, index) => (
                        <TableRow key={index + 1}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{question.question}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="mr-2">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Question Details</DialogTitle>
                                </DialogHeader>
                                <QuestionDetails question={question} />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="add">
                  <AddQuestionForm onQuestionAdded={fetchQuestions} />
                </TabsContent>
                <TabsContent value="upload">
                  <BulkUpload onUploadComplete={fetchQuestions} />
                </TabsContent>
                <TabsContent value="schedule">
                  <h3 className="text-lg font-medium mb-2">Exam Schedules</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>{schedule.exam_name}</TableCell>
                          <TableCell>{new Date(schedule.start_time).toLocaleString()}</TableCell>
                          <TableCell>{new Date(schedule.end_time).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteExamSchedule(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Add Exam Schedule Form */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-2">Add Exam Schedule</h4>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="exam_name">Exam Name</Label>
                        <Input
                          type="text"
                          id="exam_name"
                          name="exam_name"
                          value={newSchedule.exam_name}
                          onChange={handleScheduleInputChange}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          type="datetime-local"
                          id="start_time"
                          name="start_time"
                          value={newSchedule.start_time}
                          onChange={handleScheduleInputChange}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          type="datetime-local"
                          id="end_time"
                          name="end_time"
                          value={newSchedule.end_time}
                          onChange={handleScheduleInputChange}
                          className="w-full"
                        />
                      </div>
                      <Button onClick={addExamSchedule} className="bg-primary-800">
                        Add Schedule
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminQuestionsPage