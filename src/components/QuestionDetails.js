export function QuestionDetails({ question }) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Question:</h3>
          <p>{question.question}</p>
        </div>
        <div>
          <h3 className="font-semibold">Options:</h3>
          <ul className="list-disc pl-5">
            {question.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Correct Answer:</h3>
          <p>{question.correctAnswer}</p>
        </div>
      </div>
    )
  }
  
  