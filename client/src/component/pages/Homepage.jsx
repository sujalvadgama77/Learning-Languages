import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import heroimage from "../assets/hero.png";
import Footer from "../components/Footer";

const Homepage = () => {
  let navigate = useNavigate();
  const auth = localStorage.getItem("userId");

  return (
    <>
      {auth && <Navbar />}
      <div className="bg-white">
        <section className="bg-[#FCF8F1] bg-opacity-30 py-10 sm:py-16 lg:py-24">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <p className="text-base font-semibold tracking-wider text-blue-600 uppercase">
                  From words to conversation...
                </p>
                <h1 className="mt-4 text-4xl font-bold text-black lg:mt-8 sm:text-5xl xl:text-6xl">
                  Learning Languages
                </h1>
                {localStorage.getItem("userId") == null ? (
                  <div className="mt-5 flex items-center">
                    <p className="text-gray-600">Already joined us?</p>
                    <button
                      onClick={() => navigate("/login")}
                      title=""
                      className="ml-2 text-purple-600 font-semibold transition-all duration-200 hover:text-purple-800"
                    >
                      Log in
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div>
                <img className="w-full" src={heroimage} alt="" />
              </div>
            </div>
          </div>
        </section>
      </div>
      {auth && (
        <div className="bg-white from-bg-gray-200 to-bg-gray-500 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black text-center mb-4 sm:mb-6">
              Select language
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center"
                onClick={() => navigate("/sanskrit")}
              >
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-1">
                  क
                </span>{" "}
                Sanskrit
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center"
                onClick={() => navigate("/english")}
              >
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-1">
                  A
                </span>{" "}
                English
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center"
                onClick={() => navigate("/gujarati")}
              >
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-1">
                  ક
                </span>{" "}
                Gujarati
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center"
                onClick={() => navigate("/hindi")}
              >
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-1">
                  क
                </span>{" "}
                Hindi
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Homepage;
