import React from "react";
import userData from "@constants/data";
import Link from "next/link";
import Image from "next/image";

export default function AboutMe() {
  return (
    <section className="bg-white dark:bg-gray-800">
      <div className="max-w-6xl mx-auto h-48 bg-white dark:bg-gray-800">
        <h1 className=" text-5xl md:text-9xl font-bold py-20 text-center md:text-left">
          About Me.
        </h1>
      </div>
      <div className="bg-[#F1F1F1] -mt-10 dark:bg-gray-900">
        <div className="text-container max-w-6xl mx-auto pt-20">
          <p
            className="leading-loose text-2xl md:text-4xl font-semibold  mx-4"
            style={{ lineHeight: "3rem" }}
          >
            {userData.about.title}. Currently working on{" "}
            <Link
              target={'_blank'}
              className="bg-red-500 rounded-md px-2 py-1 text-white"
              href={userData.about.currentProjectUrl}
            >
              {userData.about.currentProject} ✈️
            </Link>
          </p>
        </div>
      </div>
      <div className="bg-[#F1F1F1] dark:bg-gray-900 px-4">
        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-y-20 gap-x-20">
          {/* Social Buttons */}
          <div className="inline-flex flex-col">
            <div>
              <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Contact
              </h1>
              <p className="text-lg text-gray-500 mt-4 dark:text-gray-300">
                For any sort help / enquiry, shoot a{" "}
                <Link
                  target={'_blank'}
                  href={`mailto:${userData.email}`}
                  className="text-gray-800 border-b-2 border-gray-800 dark:border-gray-300 font-bold dark:text-gray-300"
                >
                  mail
                </Link>{" "}
                and I'll get back. I swear.
              </p>
            </div>

            {/* Social Links */}
            <h1 className="text-xl font-semibold text-gray-700 mt-8 dark:text-gray-200">
              Social Links
            </h1>
            <div className="mt-4 ml-4">

              <div className="flex flex-row justify-start items-center ">
                <Link
                  target={'_blank'}
                  href={userData.socialLinks.facebook}
                  className="flex flex-row items-center space-x-4 group"
                >
                  <div className="my-4">&rarr;</div>
                  <div className="text-lg text-gray-500 font-mono relative overflow-hidden dark:text-gray-300">
                    <div className="absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-24 group-hover:translate-x-0 transition duration-300"></div>
                    Facebook
                  </div>
                </Link>
              </div>
              <div className="flex flex-row justify-start items-center">
                <Link
                  target={'_blank'}
                  href={userData.socialLinks.twitter}
                  className="flex flex-row items-center space-x-4 group"
                >
                  <div className="my-4">&rarr;</div>
                  <div className="text-lg text-gray-500 font-mono relative overflow-hidden dark:text-gray-300">
                    <div className="absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-24 group-hover:translate-x-0 transition duration-300"></div>
                    Twitter
                  </div>
                </Link>
              </div>
              <div className="flex flex-row justify-start items-center">
                <Link
                  target={'_blank'}
                  href={userData.socialLinks.github}
                  className="flex flex-row items-center space-x-4 group"
                >
                  <div className="my-4">&rarr;</div>
                  <div className="text-lg text-gray-500 font-mono relative overflow-hidden dark:text-gray-300">
                    <div className="absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-24 group-hover:translate-x-0 transition duration-300"></div>
                    GitHub
                  </div>
                </Link>
              </div>
              <div className="flex flex-row justify-start items-center">
                <Link
                  target={'_blank'}
                  href={userData.socialLinks.linkedin}
                  className="flex flex-row items-center space-x-4 group"
                >
                  <div className="my-4">&rarr;</div>
                  <div className="text-lg text-gray-500 font-mono relative overflow-hidden dark:text-gray-300">
                    <div className="absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-24 group-hover:translate-x-0 transition duration-300"></div>
                    LinkedIn
                  </div>
                </Link>
              </div>
              <div className="flex flex-row justify-start items-center">
                <Link
                  target={'_blank'}
                  href={userData.socialLinks.instagram}
                  className="flex flex-row items-center space-x-4 group"
                >
                  <div className="my-4">&rarr;</div>
                  <div className="text-lg text-gray-500 font-mono relative overflow-hidden dark:text-gray-300">
                    <div className="absolute h-0.5 w-full bg-gray-400 bottom-0 transform -translate-x-28 group-hover:translate-x-0 transition duration-300"></div>
                    Instagram
                  </div>
                </Link>
              </div>
            </div>
          </div>
          {/* Text area */}
          <div className="col-span-1 md:col-span-2">
            {userData.about.description?.map((desc, idx) => (
              <p
                key={idx}
                className="text-xl text-gray-700 mb-4 dark:text-gray-300 "
              >
                {desc}
              </p>
            ))}

            <h1 className="bg-red-500 text-3xl rounded-md px-2 py-1 inline-block font-bold text-gray-50">
              Tech Stack
            </h1>
            <div className="flex flex-row flex-wrap mt-8">
              <img
                src="https://cdn.simpleicons.org/javascript"
                className="h-10 w-10 mx-4 my-4"
                alt={"javascript"} />
              <img
                src="https://cdn.simpleicons.org/c"
                className="h-10 w-10 mx-4 my-4"
                alt={"c"} />
              <img
                src="https://cdn.simpleicons.org/c++"
                className="h-10 w-10 mx-4 my-4"
                alt={"c++"} />
              <img
                src="https://cdn.simpleicons.org/python"
                className="h-10 w-10 mx-4 my-4"
                alt={"python"} />
              <img
                src="https://cdn.simpleicons.org/html5"
                className="h-10 w-10 mx-4 my-4"
                alt={"html"} />
              <img
                src="https://cdn.simpleicons.org/css3"
                className="h-10 w-10 mx-4 my-4"
                alt={"css"} />
              <img
                src="https://cdn.simpleicons.org/django/2aa859"
                className="h-10 w-10 mx-4 my-4"
                alt={"django"} />
              <img
                src="https://cdn.simpleicons.org/fastapi"
                className="h-10 w-10 mx-4 my-4"
                alt={"fastapi"} />
              <img
                src="https://cdn.simpleicons.org/express"
                className="h-10 w-10 mx-4 my-4"
                alt={"express"} />
              <img
                src="https://cdn.simpleicons.org/flask"
                className="h-10 w-10 mx-4 my-4"
                alt={"flask"} />
              <img
                src="https://cdn.simpleicons.org/nodedotjs"
                className="h-10 w-10 mx-4 my-4"
                alt={"nodejs"} />
              <img
                src="https://cdn.simpleicons.org/react"
                className="h-10 w-10 mx-4 my-4"
                alt={"react "} />
              <img
                src="https://cdn.simpleicons.org/nextdotjs/262629"
                className="h-10 w-10 mx-4 my-4"
                alt={"next js "} />
              <img
                src="https://cdn.simpleicons.org/mongodb"
                className="h-10 w-10 mx-4 my-4"
                alt={"mongodb"} />
              <img
                src="https://cdn.simpleicons.org/mysql"
                className="h-10 w-10 mx-4 my-4"
                alt={"mysql"} />
              <img
                src="https://cdn.simpleicons.org/postgresql"
                className="h-10 w-10 mx-4 my-4"
                alt={"postgresql"} />
              <img
                src="https://cdn.simpleicons.org/numpy/2080c9"
                className="h-10 w-10 mx-4 my-4"
                alt={"mongodb"} />
              <img
                src="https://cdn.simpleicons.org/pandas/1a1dbd"
                className="h-10 w-10 mx-4 my-4"
                alt={"pandas"} />
              <img
                src="https://cdn.simpleicons.org/git"
                className="h-10 w-10 mx-4 my-4"
                alt={"git"} />
              <img
                src="https://cdn.simpleicons.org/solidity"
                className="h-10 w-10 mx-4 my-4"
                alt={"solidity"} />
              <img
                src="https://cdn.simpleicons.org/postman"
                className="h-10 w-10 mx-4 my-4"
                alt={"solidity"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
