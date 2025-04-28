import Image from "next/image";

const Footer = () => {
  return (
    <div className="flex flex-col gap-10 bg-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full text-center items-center justify-center bg-slate-100 p-10 gap-2">
        <div className="">
          <div className="flex justify-center flex-col w-[100%]">
            <Image src="/logo.png" width={70} height={70} alt="logo" />
            <p className="text-start font-extralight">
              Revolutionizing exam preparation <br />
              with AI-powered solutions.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-start">
          <p className="font-bold">products</p>
          <p className="font-extralight">features</p>
          <p className="font-extralight">pricing </p>
          <p className="font-extralight">updates</p>
        </div>
        <div className="flex flex-col gap-2 text-start">
          <p className="font-bold">Company</p>
          <p className="font-extralight">Contacts</p>
          <p className="font-extralight">Careers</p>
          <p className="font-extralight">Contact </p>
        </div>
      </div>
      <div className="w-full items-center justify-center flex bg-slate-100 mb-10">
        <p>&copy; 2025 ExamPrep AI. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
