const EmployeeLoginForm = ({
  employeeId,
  setEmployeeId,
  employeePassword, // New prop for password state
  setEmployeePassword, // New prop for password state setter
  onSubmit,
  loginStatus,
  navigate,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="employee_id" className="block text-lg font-medium text-gray-700 mb-2">
          Employee ID
        </label>
        <input
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          type="text"
          id="employee_id"
          name="employee_id"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Employee ID / Employee Code"
          required
        />
      </div>

      {/* --- Password Input Field (Minimal) --- */}
      <div>
        <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          value={employeePassword}
          onChange={(e) => setEmployeePassword(e.target.value)}
          type="password" // Crucial for hiding input
          id="password"
          name="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Password"
          required
        />
      </div>
      {/* ------------------------------------ */}

      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
      >
        Login
      </button>

      <button
        type="button"
        onClick={() => navigate("/register")}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md"
      >
        Register
      </button>

      {loginStatus === "success" && (
        <p className="text-green-600 text-center mt-4">
          Login Successful! Redirecting...
        </p>
      )}
      {loginStatus === "error" && (
        <p className="text-red-600 text-center mt-4">
          Error logging in. Please check your Employee ID.
        </p>
      )}
    </form>
  );
};

export default EmployeeLoginForm;