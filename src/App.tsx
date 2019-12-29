import * as React from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import { withAuthenticator } from 'aws-amplify-react';

import { createNote, deleteNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { 
  CreateNoteMutationVariables, 
  CreateNoteMutation, 
  ListNotesQuery, 
  DeleteNoteMutationVariables,
  DeleteNoteMutation
} from './API';
import { isNotEmpty } from './utils/is-not-empty';

interface ICreateNoteResponse {
  data?: CreateNoteMutation;
}

interface IListNotesResponse {
  data?: ListNotesQuery;
}

interface IDeleteNoteResponse {
  data?: DeleteNoteMutation
}

interface INote {
  title: string;
  id: string;
}

interface AppState {
  notes: INote[];
  noteTitle: string;
}

class App extends React.Component<{}, AppState> {
  state: AppState = {
    notes: [],
    noteTitle: ''
  }

  componentDidMount = async () => {
    const result = await API.graphql(graphqlOperation(listNotes)) as IListNotesResponse;

    const notes = result?.data?.listNotes?.items?.filter(isNotEmpty);

    if (!notes) {
      return;
    }

    this.setState({ notes });
  }

  handleChange = (event: React.FormEvent<HTMLInputElement>) => 
    this.setState({ noteTitle: (event.target as HTMLInputElement).value });

  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { noteTitle, notes } = this.state;

    const variables:CreateNoteMutationVariables = { input: { title: noteTitle }};

    const result = await API.graphql(graphqlOperation(createNote, variables)) as ICreateNoteResponse;

    const newNote = result?.data?.createNote;

    if (!newNote) {
      return;
    }
    
    this.setState({ notes: [...notes, newNote ], noteTitle: '' })
  }

  handleDelete = async (id: string) => {
    const { notes } = this.state;

    const variables: DeleteNoteMutationVariables = { input: { id } } 
    const result = await API.graphql(graphqlOperation(deleteNote, variables)) as IDeleteNoteResponse;

    const deletedNote = result?.data?.deleteNote;

    if (!deletedNote) {
      return;
    }

    const { id: deletedNoteId } = deletedNote;

    const updatedNotes = notes.filter(note => note.id !== deletedNoteId);

    this.setState({ notes: updatedNotes });
  }

  render () {
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        <form className="mb3" onSubmit={this.handleSubmit}>
          <input 
            onChange={this.handleChange} 
            value={this.state.noteTitle} 
            type="text" 
            className="pa2 f4" 
            placeholder="Write your note"
          />
          <button type="submit">Add note</button>
        </form>
        {/* Notes list */}
  
        <div>
          {this.state.notes.map(({id, title}) => 
            <div key={id} className="flex items-center">
              <li className="list pa1 f3">
                {title}
              </li>
              <button onClick={this.handleDelete.bind(this, id)} className="bg-transparent bn f4"><span>&times;</span></button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const includeGreetings = true;

export default withAuthenticator(App, includeGreetings);
