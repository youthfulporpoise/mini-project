import { Sidebar } from "@/app/components/Vendor/Sidebar"


const Page = () => {
  return (
    <div className="flex">
      <Sidebar/>
      <div className="p-5">
        <h1>Vendor Responses</h1>
      </div>
    </div>
  )
}

export default Page
