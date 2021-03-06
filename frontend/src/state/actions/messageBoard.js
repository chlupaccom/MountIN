import MessageService from "../../services/MessageService";
import SocketService from "../../services/SocketService";

export const UPDATE_MESSAGES = 'UPDATE_MESSAGES';
export const FETCH_HISTORY_REQUEST = "FETCH_MESSAGE_HISTORY_REQUEST";
export const FETCH_HISTORY_SUCCESS = "FETCH_MESSAGE_HISTORY_SUCCESS";
export const FETCH_HISTORY_ERROR = "FETCH_MESSAGE_HISTORY_ERROR";
export const CLEAR_MESSAGES = "CLEAR_MESSAGES";
export const CLEAR_CURRENT_MESSAGE = "CLEAR_CURRENT_MESSAGE";
export const UPDATE_CURRENT_MESSAGE = "UPDATE_CURRENT_MESSAGE";
export const ADD_EMOJI = "ADD_EMOTE";
export const TOGGLE_EMOJI_PICKER = "TOGGLE_EMOJI_PICKER";
export const RESET_SCROLL_DOWN = "RESET_SCROLL_DOWN";


export function sendMessage(socket, message, userId) {
    return (dispatch) => {
        SocketService.sendMessage(socket, message);
        dispatch(updateMessages(message, userId));
        dispatch(clearCurrentMessage());
    }
}

export function fetchMessageHistory(tourId, timeout) {
    return (dispatch) => {
        dispatch(fetchHistoryRequest());
        return MessageService.getMessageHistory(tourId, timeout).then((resp) => {
            console.log('Message from server', resp);
            if (resp.hasOwnProperty('error')) {
                dispatch(fetchHistoryError())
            }
            else {
                dispatch(fetchHistorySuccess(resp))
            }
        })
            .catch(error => {
                console.log(error);
                dispatch(fetchHistoryError())
            })
    }
}

function fetchHistoryRequest() {
    return {
        type: FETCH_HISTORY_REQUEST
    }
}

function fetchHistorySuccess(messages) {
    return {
        type: FETCH_HISTORY_SUCCESS,
        messages: messages
    }
}

function fetchHistoryError() {
    return {
        type: FETCH_HISTORY_ERROR
    }
}

export function updateMessages(message, userId) {
    return {
        type: UPDATE_MESSAGES,
        message: message,
        userId: userId
    }
}

export function clearMessages() {
    return {
        type: CLEAR_MESSAGES,
    }
}

export function clearCurrentMessage() {
    return {
        type: CLEAR_CURRENT_MESSAGE
    }
}

export function updateCurrentMessage(message) {
    return {
        type: UPDATE_CURRENT_MESSAGE,
        message: message
    }
}

export function addEmoji(emoji) {
    return {
        type: ADD_EMOJI,
        emoji: emoji
    }
}

export function toggleEmojiPicker() {
    return {
        type: TOGGLE_EMOJI_PICKER
    }
}

export function resetScrollDown() {
    return {
        type: RESET_SCROLL_DOWN
    }
}