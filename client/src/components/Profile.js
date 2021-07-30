import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import ExperienceEditor from "./ExperienceEditor";

export default function Profile({
    firstName,
    lastName,
    profileUrl,
    bio,
    onBioChange,
}) {
    return (
        <div className="profileDiv">
            <section className="profilePic">
                <img
                    className="profilePicture"
                    src={profileUrl}
                    alt={`${firstName} ${lastName}`}
                    title={`${firstName} ${lastName}`}
                    // onClick={onProfilePictureClick}
                ></img>
            </section>
            <section className="profileInfo">
                <h1>
                    {firstName} {lastName}
                </h1>
                {/* <p className="travelExperienceP">{bio}</p> */}
                <ExperienceEditor
                    bio={bio}
                    onBioChange={onBioChange}
                ></ExperienceEditor>
            </section>
        </div>
    );
}
