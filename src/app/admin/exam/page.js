"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Eye, Loader2, Edit, CircleCheckBig, CircleX, icons } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { BulkUpload } from "@/components/BulkUpload";
import { QuestionDetails } from "@/components/QuestionDetails";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-fox-toast";
import SuccessIcon from "@/components/ui/toast-success";

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    exam_name: "",
    start_time: "",
    end_time: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editedScheduleData, setEditedScheduleData] = useState({});
  const [isSaving, setIsSaving] = useState(false); // Track saving state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false); // Track adding schedule state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchQuestions(), fetchExamSchedules()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.", {
        className: "bg-primary-600 text-white rounded-3xl",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("/api/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions.", {
        className: "bg-primary-600 text-white rounded-3xl",
      });
    }
  };

  const fetchExamSchedules = async () => {
    try {
      const response = await axios.get("/api/exam-schedules");
      setExamSchedules(response.data);
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
      toast.error("Failed to load exam schedules.", {
        className: "bg-primary-600 text-white rounded-3xl",
      });
    }
  };

  const handleEditSchedule = (scheduleId) => {
    setEditingScheduleId(scheduleId);
    const scheduleToEdit = examSchedules.find((schedule) => schedule.id === scheduleId);
    setEditedScheduleData({ ...scheduleToEdit });
  };

  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedScheduleData({ ...editedScheduleData, [name]: value });
  };

  const updateExamSchedule = async () => {
    setIsSaving(true); // Set saving state to true
    try {
      const response = await axios.put(`/api/exam-schedules/${editingScheduleId}`, editedScheduleData);
      if (response.status === 200) {
        toast.success("Exam schedule updated successfully!", {
          className: "bg-primary-800 text-white rounded-3xl",
        });
        setEditingScheduleId(null);
        fetchExamSchedules();
      } else {
        toast.error("Failed to update exam schedule.", {
          className: "bg-primary-600 text-white rounded-3xl",
        });
      }
    } catch (error) {
      console.error("Error updating exam schedule:", error);
      toast.error("Failed to update exam schedule.", {
        className: "bg-primary-600 text-white rounded-3xl",
      });
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  const addExamSchedule = async () => {
    setIsAddingSchedule(true); // Set adding state to true
    try {
      const response = await axios.post("/api/exam-schedules", newSchedule);
      if (response.status === 201) {
        toast.success("Exam schedule added successfully!", {
          className: "bg-primary-800 text-white rounded-3xl",
        });
        setNewSchedule({
          exam_name: "",
          start_time: "",
          end_time: "",
        });
        fetchExamSchedules();
      } else {
        toast.error("Failed to add exam schedule.", {
          className: "bg-primary-600 text-white rounded-3xl",
        });
      }
    } catch (error) {
      console.error("Error adding exam schedule:", error);
      toast.error("Failed to add exam schedule.", {
        className: "bg-primary-600 text-white rounded-3xl",
      });
    } finally {
      setIsAddingSchedule(false); // Reset adding state
    }
  };

  const deleteExamSchedule = async (id) => {
    setIsDeleting(true); // Set deleting state
    try {
      await axios.delete(`/api/exam-schedules/${id}`);
      fetchExamSchedules(); // Refresh schedule list
      toast.success("Exam schedule deleted successfully!", {
        className: "bg-primary-800 text-white rounded-3xl",
      });
    } catch (error) {
      console.error("Error deleting exam schedule:", error);
      toast.error("Failed to delete exam schedule.", {
        className: "bg-primary-600 text-white rounded-3xl",
      });
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };
  const deleteQuestion = async (id) => {
    setIsDeleting(true); // Set loading to true
    try {
      await axios.delete(`/api/questions/${id}`)
      fetchQuestions() // Refresh question list
      toast.success("Question deleted successfully!", {
        className: 'bg-primary-800 text-white rounded-3xl',
      });
    } catch (error) {
      console.error("Error deleting question:", error)
      toast.error("Failed to delete question.", {
        className: 'bg-primary-600 text-white rounded-3xl',
      });
    } finally {
      setIsDeleting(false)
    }
  }

  const handleActivateExam = async (id) => {
    try {
      setIsActivating(true);
      const response = await axios.put(`/api/exam-schedule-activate`, {id : id});
      toast.success("Exam Activated successfully", { icons: <SuccessIcon /> });
      setIsActivating(false);
      fetchExamSchedules();
    } catch (error) {
      toast.error("Error activating exam");
      setIsActivating(false);
    }
  }

  const handleDeactivateExam = async (id) => {
    try {
      setIsActivating(true);
      const response = await axios.put(`/api/exam-schedule-deactivate`, {id: id});
      toast.success("Exam Deactivated successfully", { icons: <SuccessIcon /> });
      setIsActivating(false);
      fetchExamSchedules();
    } catch (error) {
      toast.error("Error deactivating exam");
      setIsActivating(false);
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
            <TabsList className="w-full flex justify-between px-10 items-center py-5">
              <TabsTrigger value="list" className="text-xs md:text-medium">Question List</TabsTrigger>
              <TabsTrigger value="add" className="text-xs md:text-medium">Add Question</TabsTrigger>
              <TabsTrigger value="upload" className="text-xs md:text-medium">Bulk Upload</TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs md:text-medium">Exam Schedule</TabsTrigger>
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
                              <DialogContent className="w-4/5 rounded-lg">
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
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
                        <TableHead>Is Active</TableHead>
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
                              />
                            ) : (
                              `${schedule?.end_time.split("T")[0]}, ${schedule?.end_time.split("T")[1].slice(0, 8)}`
                            )}
                          </TableCell>
                          <TableCell>
                            {/* {editingScheduleId === schedule.id ? (
                              <Input
                                type="datetime-local"
                                name="end_time"
                                value={editedScheduleData.is_active || ""}
                                onChange={handleScheduleInputChange}
                              />
                            ) : ( */}
                            {schedule.is_active ? "True" : "False"}
                            {/* )} */}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingScheduleId === schedule.id ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={updateExamSchedule}
                                  disabled={isSaving}
                                  className="mr-2"
                                >
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingScheduleId(null)}
                                  disabled={isSaving}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="mr-2"
                                  onClick={() => handleEditSchedule(schedule.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="mr-2"
                                  title={`${schedule.is_active ? "Deactivate" : "Activate"}`}
                                  onClick={() => {
                                    if (schedule.is_active) {
                                      handleDeactivateExam(schedule.id);
                                    } else {
                                      handleActivateExam(schedule.id);
                                    }
                                  }}
                                >
                                  {schedule.is_active
                                    ? isActivating
                                      ?
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      :
                                      <CircleX className="h-4 w-4" />

                                    : isActivating
                                      ?
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      :
                                      <CircleCheckBig className="h-4 w-4" />

                                  }
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => deleteExamSchedule(schedule.id)}
                                  disabled={isDeleting} // Disable delete button when deleting
                                >
                                  {isDeleting ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>

                              </>
                            )}
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
                      <Button onClick={addExamSchedule} className="bg-primary-800" disabled={isAddingSchedule}>
                        {isAddingSchedule ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Schedule"
                        )}
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