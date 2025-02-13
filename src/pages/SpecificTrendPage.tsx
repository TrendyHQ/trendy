import { useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { CommentObject, SpecificTrend } from "../types";
import { useAuth0 } from "@auth0/auth0-react";

export default function SpecificTrendPage() {
  const { user } = useAuth0();
  const location = useLocation();
  const trendId = location.pathname.split("/")[2];

  const [trendData, setTrendData] = useState<SpecificTrend>(
    {} as SpecificTrend
  );

  const getSpecificTrend = () => {
    try {
      axios
        .get(`http://localhost:8080/api/reddit/trend`, {
          params: {
            postId: trendId,
          },
        })
        .then((response) => {
          setTrendData(response.data);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = (comment: string) => {
    if (user?.sub) {
      const date = new Date().toDateString();
      const commentObject: CommentObject = {
        userId: user.sub,
        value: comment,
        datePublished: date,
        nick: user.nickname || "Anonymous",
      };

      try {
        axios
          .put(`http://localhost:8080/api/data/addCommentToPost`, {
            postId: trendId,
            comment: commentObject,
          })
          .then(() => {
            getSpecificTrend();
          });
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getSpecificTrend();
  }, [trendId]);

  return (
    <div className="bodyCont">
      <Header />
      <h1>Specific Trend Page</h1>
      {trendData && (
        <div>
          <h2>{trendData.title}</h2>
          <p>{trendData.moreInfo}</p>
          <p>{trendData.link}</p>
          <br />
          <label htmlFor="commentInput">New Comment:</label>
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addComment((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
            type="text"
            id="commentInput"
          />
          <br />
          <h2>Comments:</h2>
          {trendData.comments &&
            trendData.comments.map((comment: CommentObject, index) => (
              <div key={index}>
                <p>{comment.nick}</p>
                <p>
                  {comment.datePublished}: {comment.value}
                </p>
              </div>
            ))}
        </div>
      )}
      <Footer />
    </div>
  );
}
