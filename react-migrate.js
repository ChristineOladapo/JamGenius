class Question {
    constructor(q, a) {
      this.q = q;
      this.a = a;
    }
  }
  
  function TriviaApp() {
    const [answers, setAnswers] = React.useState([]);
    const [quizStarted, setQuizStarted] = React.useState(false);
    const [current, setCurrent] = React.useState(0);
    const [questions, setQuestions] = React.useState([]);
  
    const startQuiz = (number, difficulty) => {
        fetch(`http://127.0.0.1:5001/api/trivia?number=${number}&difficulty=${difficulty}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            if (data.results) {
              const arr = data.results.map(
                (each) => new Question(each.question, each.all_answers)
              );
              setQuestions(arr);
              setQuizStarted(true);
              setCurrent(0); // Start from the first question
            } else {
              console.error("Unexpected data structure:", data);
              alert("Could not retrieve questions. Please try again.");
            }
          })
          .catch((error) => {
            console.error("Error getting questions:", error);
            alert(`An error occurred while fetching the quiz questions: ${error.message}`);
          });
      };
      
  
    const nextQuestion = (choice) => {
      setAnswers([...answers, choice]);
      setCurrent((prev) => prev + 1); // Move to the next question
    };
  
    const finishQuiz = () => {
      fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      .then((response) => response.json())
      .then((data) => alert(`You scored ${data.total} out of ${questions.length}`))
      .catch((error) => console.error("Error submitting answers:", error));
      
      setQuizStarted(false); // Reset quiz state after finishing
    };
  
    return (
      <div>
        <h1 id="titleHeader">Test Your Knowledge With a Musical Trivia!</h1>
        <p id="subtext">
          With over 100+ music genres in the world, think you have what it takes to call yourself a music enthusiast?
          Challenge yourself with this one-of-a-kind Music Jam.
        </p>
        {quizStarted ? (
          current < questions.length ? (
            <TriviaQuestion 
              current={current} 
              questions={questions} 
              nextQuestion={nextQuestion} 
            />
          ) : (
            <TriviaScoreboard finishQuiz={finishQuiz} total={questions.length} />
          )
        ) : (
          <TriviaStart startQuiz={startQuiz} />
        )}
      </div>
    );
  }
  
  function TriviaQuestion({ current, questions, nextQuestion }) {
    return (
      <div>
        <h2>Question: {questions[current].q}</h2>
        {questions[current].a.map((each, i) => (
          <button key={i} onClick={() => nextQuestion(each)}>
            {each}
          </button>
        ))}
      </div>
    );
  }
  
  function TriviaScoreboard({ finishQuiz, total }) {
    return (
      <div>
        <h2>You've completed the quiz!</h2>
        <button onClick={finishQuiz}>See Your Score</button>
      </div>
    );
  }
  
  function TriviaStart({ startQuiz }) {
    const [number, setNumber] = React.useState(10);
    const [difficulty, setDifficulty] = React.useState("Easy");
  
    const handleSubmit = (e) => {
      e.preventDefault();
      startQuiz(number, difficulty.toLowerCase());
    };
  
    return (
      <div id="form">
        <form onSubmit={handleSubmit}>
          <h2 className="question">Number of Questions:</h2>
          <select value={number} onChange={(e) => setNumber(e.target.value)} className="dropDown">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <h2 className="question">Difficulty:</h2>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="dropDown">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <input type="submit" value="Begin Quiz!" id="submitForm" />
        </form>
      </div>
    );
  }
  
  // Use createRoot for React 18 compatibility
  const root = ReactDOM.createRoot(document.getElementById("react-root"));
  root.render(<TriviaApp />);
  