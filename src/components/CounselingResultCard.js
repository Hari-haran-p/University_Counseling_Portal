import { CheckCircle, User, Briefcase, Phone, Users } from "lucide-react"


export default function CounselingResultCard({ result }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Counseling Result</h3>
            {/* <span className="bg-white text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              ID: {result.user_id}
            </span> */}
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 px-6 py-3 border-b border-green-100">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Department Successfully Assigned</p>
          </div>
        </div>

        {/* Department Section */}
        <div className="px-6 py-5 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center mb-1">
            <Briefcase className="h-5 w-5 text-primary-600 mr-2" />
            <h4 className="text-sm font-semibold text-gray-500">ASSIGNED DEPARTMENT</h4>
          </div>
          <div className="mt-1">
            <h2 className="text-2xl font-bold text-gray-800">{result.department_name}</h2>
            <p className="text-primary-700">{result.description}</p>
          </div>
        </div>

        {/* User Details */}
        <div className="px-6 py-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">APPLICANT DETAILS</h4>

          <div className="space-y-3">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-sm font-medium text-gray-800">{result.username}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Mobile Number</p>
                <p className="text-sm font-medium text-gray-800">{result.mobno}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Community</p>
                <p className="text-sm font-medium text-gray-800">{result.community}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Download PDF</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Accept & Continue
            </button>
          </div>
        </div> */}
      </div>
    </div>
  )
}

