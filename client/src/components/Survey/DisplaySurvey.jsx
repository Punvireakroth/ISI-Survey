import { Button, Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import uniqid from "uniqid";
import {
  SurveyTitle,
  Paragraph,
  ShortResponse,
  TrueFalse,
} from "./displayQuestionComponents";

const DisplaySurvey = (props) => {
  const [survey, setSurvey] = useState({});
  const [newForm, setNewForm] = useState(
    <div style={{ textAlign: "center", padding: 20 }}>
      <Spinner animation="border" />
    </div>
  );
  const navigate = useNavigate();
  const { id } = useParams();

  const callApi = useCallback(async (url, fetchOptions) => {
    try {
      const response = await fetch(
        `http://localhost:5000/${url}`,
        fetchOptions
      );
      const responseData = await response.json();

      let questions = [];
      responseData.questions.forEach((question) => {
        const newQuestion = {
          _id: question._id,
          type: question.type,
          question: question.answer_choices,
          response: {
            response: "",
            time: "",
            _id: uniqid("response-"),
          },
        };
        questions.push(newQuestion);
      });

      let updatedSurvey = {
        _id: responseData._id,
        questions: questions,
        title: responseData.title,
        description: responseData.description,
        user_id: responseData.user_id,
        creationTime: responseData.creationTime,
      };
      setSurvey(updatedSurvey);
    } catch (err) {
      console.log(err);
    }
  });

  const handleChange = (e, responseId, responseType, answerVlaue) => {
    let surveyObject = { ...survey };
    let index = surveyObject.questions.findIndex(
      (question) => question.response._id === responseId
    );
    surveyObject.questions[index].response.response = {
      ...surveyObject.questions[index].response,
      response: e.target.value,
      time: new Date(),
    };
    setSurvey(surveyObject);
  };

  const submitSurvey = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/surveys/update-responses/${survey._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questions: survey.questions,
            _id: survey._id,
          }),
        }
      );

      navigate(`/display-survey/submit-survey/${id}`);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setSurvey({ ...survey, _id: id });
    callApi(`/api/surveys/${id}`, {
      method: "GET",
    });
  }, []);

  useEffect(() => {
    if (survey.title === undefined) {
      setNewForm(
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spinner animation="border" />
        </div>
      );
    } else {
      let form = survey.questions.map((question, index) => {
        switch (question.type) {
          case "short response":
            return (
              <ShortResponse
                key={question._id}
                question={question}
                index={index}
                onChange={handleChange}
                responseId={question.response._id}
              />
            );
          case "true/false":
            return (
              <TrueFalse
                key={question._id}
                question={question}
                index={index}
                onChange={handleChange}
                responseId={question.response._id}
              />
            );
          case "paragraph":
            return (
              <Paragraph
                key={question._id}
                question={question}
                index={index}
                onChange={handleChange}
                responseId={question.response._id}
              />
            );
          default:
            return null;
        }
      });
      setNewForm(form);
    }
  }, [survey]);

  return (
    <div className="displaySurvey">
      <SurveyTitle survey={survey} />
      {newForm}
      <Button onClick={submitSurvey}>Submit Survey</Button>
    </div>
  );
};

export default DisplaySurvey;
