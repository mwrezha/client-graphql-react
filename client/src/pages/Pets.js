import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'


const GET_PETS = gql`
  query getPets {
    pets {
      name
      id
      type
      img
    }
  }
`;

const CREATE_PET = gql`
  mutation createPet($input: NewPetInput!) {
    addPet(input: $input) {
      id
      type
      name
      img
    }
  }
`;

export default function Pets () {
  const [modal, setModal] = useState(false)
  const {data, loading, error} = useQuery(GET_PETS);

  const [
    createpet, 
    createdPet
  ] = useMutation(CREATE_PET, {
    update(cache, { data: { addPet } }) {
      const { pets } = cache.readQuery({ query: GET_PETS });
      cache.writeQuery({
        query: GET_PETS,
        data: { pets: [addPet, ...pets] }
      })
    }
  });

  if (loading) return <Loader />;
  if (error || createdPet.error) return `Error! ${error.message} $${createdPet.error.message}`;

  const onSubmit = input => {
    setModal(false)
    createpet({
      variables: {
        input: input
      },
      optimisticResponse: {
        __typename: 'Mutation',
        addPet: {
          __typename: 'Pet',
          id: Math.floor(Math.random() * 1000) + '',
          name: input.name,
          type: input.type,
          img: 'https://via.placeholder.com/300',
        }
      }
    });
  }
  
  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets || []}/>
      </section>
    </div>
  )
}
