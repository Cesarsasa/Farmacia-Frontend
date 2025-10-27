import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
    </>
  )
}

export default MainLayout