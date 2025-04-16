import Header from "./components/Header";
import { Button } from "@/components/ui/button";
import Footer from "./components/Footer";
import { Wand2, TrendingUp, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="w-full h-auto py-15 p-2">
        <p className="text-5xl font-extrabold text-center md:leading-15 md:text-7xl">
          Generate Smart <br /> Question paper In <br /> Seconds
        </p>
        <p className="font-extralight mt-7 text-center">
          Advanced AI-powered platform designed specifically for <br /> JEE,
          NEET, and CET exam preparation
        </p>
        <div className="my-15 flex gap-5 w-full justify-center">
          <Button>Getting started</Button>
          <Button variant="outline">Watch Demo</Button>
        </div>
      </div>
      <div className="w-full h-auto px-5 py-10 bg-slate-50 flex flex-col gap-5 md:flex-row md:items-center md:justify-center md:p-15">
        <div className="bg-white p-5 pl-7 shadow-md rounded-lg md:p-10 ">
          <Wand2 size={20} />
          <p className="text-xl font-extrabold">Ai powered Generation</p>
          <p className="font-extralight pt-2">
            Instantly create unique question papers <br />
            tailored to your specific requirements
          </p>
        </div>
        <div className="bg-white p-5 pl-7 shadow-md rounded-lg md:p-10 ">
          <TrendingUp size={20} />
          <p className="text-xl font-extrabold">Exam Analytics</p>
          <p className="font-extralight pt-2">
            Detailed insights and performance <br />
            tracking for better preparation
          </p>
        </div>
        <div className="bg-white p-5 pl-7 shadow-md rounded-lg md:p-10 ">
          <GraduationCap size={20} />
          <p className="text-xl font-extrabold">Exam-Specific</p>
          <p className="font-extralight pt-2">
            Customized for JEE, NEET, and CET exam
            <br />
            patterns and syllabus
          </p>
        </div>
      </div>
      <div className="p-5 w-full h-auto md:p-15">
        <div className="bg-black text-white px-5 py-10 rounded-2xl flex flex-col gap-2 md:p-15 text-center md:items-center md:gap-5">
          <p className="font-extrabold text-2xl md:text-5xl md:leading-[4rem]">
            Ready to transform your <br />
            exam preparation?
          </p>
          <p>Join thousands of students already using our platform</p>
          <Button variant="secondary" className="md:w-[200px]">
            Get started free
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
