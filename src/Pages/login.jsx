import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Lock, Loader2 } from "lucide-react";
import logo from '../assets/aeu.png'

const StaffLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    idCard: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.idCard || !formData.password) {
      setErrorMessage("សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់ | Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/Login/StaffLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IDCard: formData.idCard,
          Pwd: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ការចូលប្រព័ន្ធបរាជ័យ | Login failed");
      }

      navigate("/dashboard");

    } catch (error) {
      setErrorMessage(error.message || "មានបញ្ហាក្នុងការតភ្ជាប់ | Connection Error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logo} alt="AEU Logo" className="h-12 mx-auto mb-2" />
          <h5 className="text-slate-500 font-normal text-sm">បុគ្គលិកចូលប្រព័ន្ធ | Staff Log In</h5>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-700 text-center p-3 text-sm mb-4 rounded-xl border border-red-200" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-600 text-sm font-semibold mb-1.5">
              លេខទូរស័ព្ទ ឬ អត្តលេខ | Phone or AEU ID
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
              <span className="bg-slate-100 text-slate-400 px-3 py-2.5 border-r border-slate-300">
                <User size={18} />
              </span>
              <input
                type="text"
                className="w-full px-3 py-2.5 outline-none text-slate-700"
                name="idCard"
                value={formData.idCard}
                onChange={handleChange}
                placeholder="Phone or AEU ID"
                required
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-slate-600 text-sm font-semibold mb-1.5">
              ពាក្យសម្ងាត់ | Password
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
              <span className="bg-slate-100 text-slate-400 px-3 py-2.5 border-r border-slate-300">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="w-full px-3 py-2.5 outline-none text-slate-700"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 font-semibold shadow-sm mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>កំពុងដំណើរការ...</span>
              </>
            ) : (
              "ចូលប្រព័ន្ធ | Log In"
            )}
          </button>

          <div className="flex justify-between items-center text-sm mt-3">
            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors no-underline">
              ចុះឈ្មោះថ្មី | New Register
            </a>
            <a href="#" className="text-blue-600 font-medium no-underline hover:text-blue-800 transition-colors">
              ភ្លេចពាក្យសម្ងាត់ | Forgot?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffLogin;
