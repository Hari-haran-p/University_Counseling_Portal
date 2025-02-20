"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Trash2, Eye, Loader2, Edit } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([])
  const [examSchedules, setExamSchedules] = useState([])
  const [newSchedule, setNewSchedule] = useState({
    exam_name: "",
    start_time: "",
    end_time: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [editingScheduleId, setEditingScheduleId] = useState(null)
  const [editedScheduleData, setEditedScheduleData] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchQuestions(), fetchExamSchedules()])
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Failed to load data. Please try again.")
    } finally {
      setIsLoading(false)
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

  const handleEditSchedule = (scheduleId) => {
    setEditingScheduleId(scheduleId)
    const scheduleToEdit = examSchedules.find((schedule) => schedule.id === scheduleId)
    setEditedScheduleData({ ...scheduleToEdit })
  }

  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target
    setEditedScheduleData({ ...editedScheduleData, [name]: value })
  }

  const updateExamSchedule = async () => {
    try {
      const response = await axios.put(`/api/exam-schedules/${editingScheduleId}`, editedScheduleData)
      if (response.status === 200) {
        alert("Exam schedule updated successfully!")
        setEditingScheduleId(null)
        fetchExamSchedules()
      }
    } catch (error) {
      console.error("Error updating exam schedule:", error)
      alert("Failed to update exam schedule.")
    }
  }

  const addExamSchedule = async () => {
    try {
      const response = await axios.post("/api/exam-schedules", newSchedule)
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
    <div className="container mx-auto py-4 px-2 md:py-10 md:px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">Exam Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <ScrollArea className="w-full">
              <TabsList className="flex w-full md:grid md:grid-cols-4">
                <TabsTrigger value="list" className="text-xs md:text-base">
                  Question List
                </TabsTrigger>
                <TabsTrigger value="add" className="text-xs md:text-base">
                  Add Question
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs md:text-base">
                  Bulk Upload
                </TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs md:text-base">
                  Exam Schedule
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="mr-2 h-6 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <TabsContent value="list">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px] md:w-[100px]">ID</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questions.map((question, index) => (
                          <TableRow key={index + 1}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="max-w-[150px] md:max-w-none truncate">{question.question}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="mr-2">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="w-11/12 max-w-3xl rounded-lg">
                                  <DialogHeader>
                                    <DialogTitle>Question Details</DialogTitle>
                                  </DialogHeader>
                                  <QuestionDetails question={question} />
                                </DialogContent>
                              </Dialog>
                              <Button variant="destructive" size="icon" onClick={() => deleteQuestion(question.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="add">
                  <AddQuestionForm onQuestionAdded={fetchQuestions} />
                </TabsContent>
                <TabsContent value="upload">
                  <BulkUpload onUploadComplete={fetchQuestions} />
                </TabsContent>
                <TabsContent value="schedule">
                  <h3 className="text-lg font-medium mb-2">Exam Schedules</h3>
                  <div className="overflow-x-auto">
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
                            <TableCell>
                              {editingScheduleId === schedule.id ? (
                                <Input
                                  type="text"
                                  name="exam_name"
                                  value={editedScheduleData.exam_name || ""}
                                  onChange={handleScheduleInputChange}
                                  className="w-full"
                                />
                              ) : (
                                schedule.exam_name
                              )}
                            </TableCell>
                            <TableCell>
                              {editingScheduleId === schedule.id ? (
                                <Input
                                  type="datetime-local"
                                  name="start_time"
                                  value={editedScheduleData.start_time || ""}
                                  onChange={handleScheduleInputChange}
                                  className="w-full"
                                />
                              ) : (
                                `${schedule?.start_time.split("T")[0]}, ${schedule?.start_time.split("T")[1].slice(0, 8)}`
                              )}
                            </TableCell>
                            <TableCell>
                              {editingScheduleId === schedule.id ? (
                                <Input
                                  type="datetime-local"
                                  name="end_time"
                                  value={editedScheduleData.end_time || ""}
                                  onChange={handleScheduleInputChange}
                                  className="w-full"
                                />
                              ) : (
                                `${schedule?.end_time.split("T")[0]}, ${schedule?.end_time.split("T")[1].slice(0, 8)}`
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingScheduleId === schedule.id ? (
                                <div className="flex justify-end space-x-2">
                                  <Button size="sm" onClick={updateExamSchedule}>
                                    Save
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingScheduleId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" size="icon" onClick={() => handleEditSchedule(schedule.id)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => deleteExamSchedule(schedule.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                          onChange={(e) => setNewSchedule({ ...newSchedule, exam_name: e.target.value })}
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
                          onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
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
                          onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <Button onClick={addExamSchedule} className="w-full md:w-auto bg-primary-800">
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

