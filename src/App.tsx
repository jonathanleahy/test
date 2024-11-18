
import './App.css'

import {useDashboardData} from "@/hooks/useDashboardData.tsx";
import {WorkDashboard} from "@/components/WorkDashboard.tsx";


function App() {

    const { data: mockData, loading, error } = useDashboardData('/example.json');

    if (error) {
        return <div>Error: {error.message}</div>;
    }

  return (
      <div className="min-h-screen bg-white">
          <h1>Parent Component</h1>
          <WorkDashboard isLoading={loading} mockData={mockData}/>
      </div>
  )
}

export default App
