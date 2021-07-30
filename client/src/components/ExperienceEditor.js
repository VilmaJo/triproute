import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";

export default function ExperienceEditor({ bio, onBioChange, userId }) {
    console.log("ExperienceEditor", userId == undefined);
    const [editMode, setEditMode] = useState(false);
    const [draftText, setDraftText] = useState("");

    function onEditButtonClick() {
        setEditMode(true);
    }

    function onInput(event) {
        if (event.target.value) {
            setDraftText(event.target.value);
            return;
        }

        setDraftText(draftText);
    }

    function onSubmit(event) {
        event.preventDefault();
        axios.post("/api/user/id", { bio: draftText });
        onBioChange(draftText);
        setEditMode(false);
    }

    function onCancelClick() {
        setEditMode(false);
    }

    function renderEditMode() {
        return (
            <form onSubmit={onSubmit}>
                <textarea
                    className="editModeText"
                    onInput={onInput}
                    defaultValue={bio}
                ></textarea>
                <p>
                    <button onSubmit={onSubmit}>Save Travelexperience</button>
                    <button onClick={onCancelClick}>Cancel</button>
                </p>
            </form>
        );
    }

    function renderButton() {
        if (userId == undefined) {
            return;
        }
        return (
            <button onClick={onEditButtonClick}>{bio ? `Edit` : `Add`}</button>
        );
    }

    function renderDisplayMode() {
        return (
            <div>
                <p className="travelExperienceP">{bio}</p>
                <p>{renderButton()}</p>
            </div>
        );
    }

    return <div>{editMode ? renderEditMode() : renderDisplayMode()}</div>;
}
