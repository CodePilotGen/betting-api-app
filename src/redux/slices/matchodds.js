import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';

const initialState = {
  isLoading: false,
  error: false,
  matches: [],
  matchesList: []
};

const slice = createSlice({
  name: 'matchodds',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // GET Matches
    getMatchesSucess(state, action) {
      state.isLoading = false;
      state.matchesList = action.payload;
    },
    // DELETE Match
    deleteMatch(state, action) {
      const filteredMatches = filter(state.matchesList, (match) => match._id !== action.payload);
      state.matchesList = filteredMatches;
    }
  }
});

// Reducer
export default slice.reducer;
// Actions
export const { deleteMatch } = slice.actions;

// ----------------------------------------------------------------------

export function getMatchesList() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/matches');
      // console.log(response.data.matches);
      dispatch(slice.actions.getMatchesSucess(response.data.matches));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------
