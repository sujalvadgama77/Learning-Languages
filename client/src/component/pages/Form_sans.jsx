/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../../../url";
import Confirmation from "../Confirmation";
import { barakhdi } from "../../data/barakhadi_sans";
import { words } from "../../data/words_sans";
import { shlok } from "../../data/shlok_sans";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase/Firebase";
import Popup from "../components/Popup";

const AudioRecorder = () => {
  const [id, setId] = useState(null);
  const [email, setEmail] = useState(null);
  const [category, setCategory] = useState("barakhdi");
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioURL, setAudioURL] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [response, setResponse] = useState("No Data");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [currentCardId, setCurrentCardId] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const mediaStreamRef = useRef(null);
  const [totalPoints, setTotalPoints] = useState(50); // Default total points for the basic category
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userId");
    if (storedEmail) {
      setEmail(storedEmail);
      const q = query(
        collection(db, "users"),
        where("Email", "==", storedEmail)
      );
      getQuery(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, earnedPoints]);

  const getQuery = async (q) => {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userData = doc.data();
      setId(doc.id);
      setEarnedPoints(userData?.Sanskrit_point);
      if (category === "barakhdi" && earnedPoints >= 50) {
        setCategory("words");
        setCurrentCardIndex(0);
        setTotalPoints(150); // Change total points for the intermediate category
      } else if (category === "words" && earnedPoints >= 150) {
        setCategory("shlok");
        setCurrentCardIndex(0);
        setTotalPoints(300); // Change total points for the advance category
      } else {
        setTimeout(() => {
          resetState();
        }, 3000);
      }
    } else {
      // console.log("No matching documents.");
    }
  };

  let categoryData;
  switch (category) {
    case "barakhdi":
      categoryData = barakhdi;
      break;
    case "words":
      categoryData = words;
      break;
    case "shlok":
      categoryData = shlok;
      break;
    default:
      categoryData = barakhdi;
  }

  useEffect(() => {
    // Simulating the Sanskrit model loading
    const modelLoadingTimeout = setTimeout(() => {
      setModelLoaded(true);
    }, 20000);

    return () => clearTimeout(modelLoadingTimeout);
  }, []);

  const startRecording = async () => {
    setAudioChunks([]);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStreamRef.current = mediaStream;
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setAudioChunks([...audioChunks, event.data]);
    }
  };

  const handlePlay = () => {
    if (audioChunks.length === 0) {
      console.warn("No audio data recorded.");
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const url = URL.createObjectURL(audioBlob);
    setAudioURL(url);

    const audio = new Audio(url);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  const updatedCount = async (newPoints) => {
    let updateData = {
      Sanskrit_point: newPoints,
    };
    if (id) {
      await updateDoc(doc(db, "users", id), updateData);
    }
  };

  const uploadBlob = async () => {
    console.log(barakhdi[currentCardIndex].id);
    if (audioChunks.length === 0) {
      console.warn("No audio data recorded.");
      return;
    }

    setUploading(true);

    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio_data", audioBlob, "recorded_audio.wav");
    formData.append("type", "wav");

    try {
      const apiUrl = `${BASE_URL}/upload_sans`;
      const response = await fetch(apiUrl, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      });
      const responseData = await response.json();
      console.log("Audio uploaded successfully:", responseData);

      const stringToCheck = JSON.stringify(responseData?.text)
        .replace(/<s>|<\/s>|\s+/g, "")
        .replace(/"/g, "");

      setResponse(stringToCheck);
      console.log("Outside ", stringToCheck);
      console.log("Outside ", categoryData[currentCardIndex].sanskrit);
      console.log(
        "Outside ",
        stringToCheck == categoryData[currentCardIndex].sanskrit
      );

      if (stringToCheck == categoryData[currentCardIndex].sanskrit) {
        console.log("Inside ", stringToCheck);
        console.log(stringToCheck);
        toast.success("Great Job!");

        // Increment earned points by 5
        setEarnedPoints((prevPoints) => {
          const newPoints = prevPoints + 5;
          updatedCount(newPoints); // Call updatedCount with the new points
          return newPoints;
        });

        setTimeout(() => {
          setCurrentCardIndex(currentCardIndex + 1);
          resetState();
        }, 3000);

        // Check if the earned points reach a threshold to switch categories
      } else {
        toast.error("Please try again");
        setShowPopup(true);
        resetState();
      }

      setUploaded(true);
    } catch (error) {
      console.error("Error uploading audio:", error);
      setAudioChunks([]);
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setCurrentCardIndex(0);
    setEarnedPoints(0);
  };

  const resetState = () => {
    setRecording(false);
    setAudioChunks([]);
    setAudioURL(null);
    setUploaded(false);
    setResponse("No Data");
    setModelLoaded(false);
    setUploading(false);
    setShowConfirmationDialog(false);
    setCurrentCardId(null);
  };

  const handleConfirmation = () => {
    resetState();
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 flex flex-col items-center min-h-screen py-8">
        <h1 className="text-4xl font-bold mb-4 text-purple-700 md:text-5xl">
          Learning Languages
        </h1>
        <ToastContainer />
        <div className="mb-4">
          <label htmlFor="category" className="mr-2 font-semibold">
            Choose a category:
          </label>
          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:text-lg"
          >
            <option value="barakhdi">Basic</option>
            <option value="words">Intermediate</option>
            <option value="shlok">Advance</option>
          </select>
        </div>
        <div className="card bg-white rounded-lg shadow-md p-6 md:p-8 mb-6 max-w-3xl w-full md:w-2/3 lg:w-1/2">
          <div className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 text-center">
            {categoryData[currentCardIndex].sanskrit}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="pronunciation text-base md:text-lg mb-2 md:mb-0">
              <span className="font-semibold">Pronunciation:</span>{" "}
              {categoryData[currentCardIndex].pronunciation}
            </div>
            {categoryData[currentCardIndex].meaning ? (
              <div className="meaning text-base md:text-lg">
                <span className="font-semibold">Meaning:</span>{" "}
                {categoryData[currentCardIndex].meaning}
              </div>
            ) : (
              " "
            )}
          </div>
        </div>
        <div className="button_container flex flex-wrap justify-center mb-4">
          <button
            onClick={startRecording}
            disabled={recording || uploaded}
            className="bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded mb-2 w-full sm:w-auto sm:mr-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            disabled={!recording || uploaded}
            className="bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded mb-2 w-full sm:w-auto sm:mr-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
          >
            Stop Recording
          </button>
          <button
            onClick={uploadBlob}
            disabled={audioChunks.length === 0 || uploaded || recording}
            className="bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded mb-2 w-full sm:w-auto sm:mr-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
          >
            Upload Audio
          </button>
          {/* <button
            onClick={handlePlay}
            disabled={!uploaded || recording}
            className="bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded mb-2 w-full sm:w-auto sm:mr-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
          >
            Play Recorded Audio
          </button> */}
          <button
            onClick={() => setShowConfirmationDialog(true)}
            // disabled={!uploaded || recording}
            className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded mb-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
          >
            Reset
          </button>
        </div>
        {uploaded && (
          <p className="text-green-500 sm:text-lg">
            Audio uploaded successfully!
          </p>
        )}
        {audioURL && (
          <audio controls src={audioURL} className="mb-4 sm:w-1/2"></audio>
        )}

        {showConfirmationDialog && (
          <Confirmation
            handleConfirmation={handleConfirmation}
            setShowConfirmationDialog={setShowConfirmationDialog}
          />
        )}

        <div className="container mx-auto px-4">
          <div className="points_container text-center mb-8">
            <div className="bg-purple-700 text-white rounded-md py-4 px-6 mb-4 inline-block mr-4">
              {" "}
              {/* Added margin to the right */}
              <h2 className="text-lg font-semibold mb-2">Total Points</h2>
              <p className="text-2xl">{totalPoints}</p>
            </div>
            <div className="bg-green-500 text-white rounded-md py-4 px-6 inline-block">
              <h2 className="text-lg font-semibold mb-2">Earned Points</h2>
              <p className="text-2xl">{earnedPoints}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        videoUrl="https://www.youtube.com/embed/VW9AFwSO-Xo"
      />
    </>
  );
};

export default AudioRecorder;
