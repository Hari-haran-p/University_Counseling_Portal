// app/counseling/results/page.js

import axios from "axios";
import { useEffect, useState } from "react";
import CounselingResultCard from "./CounselingResultCard";
import { toast } from "react-fox-toast";
import { Loader2 } from "lucide-react";


const CounselingResultsPage = () => {

  const [result, setResult] = useState({});
  const [noResults, setNotResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounselingResult = async () => {
      try {
        const response = await axios.get("/api/counseling/student-seat-view");
        console.log(response);
        if (response?.data?.length > 0) {
          setResult(response.data[0]);
          setNotResults(false);
        }
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch data");
      }
    }
    fetchCounselingResult();
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Counseling Results</h2>
      {
        noResults
          ?
          <p>Counseling results will be displayed here.</p>
          :
          <CounselingResultCard result={result} />
      }
    </div>
  )
};
export default CounselingResultsPage;