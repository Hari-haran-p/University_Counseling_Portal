import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentApplications = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    course: "Computer Science",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    course: "Business Administration",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    course: "Mechanical Engineering",
  },
  {
    name: "William Kim",
    email: "william.kim@email.com",
    course: "Psychology",
  },
  {
    name: "Sofia Rodriguez",
    email: "sofia.rodriguez@email.com",
    course: "Nursing",
  },
]

export function RecentApplications() {
  return (
    <div className="space-y-8">
      {recentApplications.map((application) => (
        <div key={application.email} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg?height=36&width=36" alt={application.name} />
            <AvatarFallback>
              {application.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{application.name}</p>
            <p className="text-sm text-muted-foreground">{application.email}</p>
          </div>
          <div className="ml-auto font-medium">{application.course}</div>
        </div>
      ))}
    </div>
  )
}

