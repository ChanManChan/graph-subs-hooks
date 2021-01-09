import React from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { addMessageMutation, messagesQuery, messageAddedSubscription } from './graphql/queries'
// import { addMessage, getMessages, onMessageAdded } from './graphql/queries'
import MessageInput from './MessageInput'
import MessageList from './MessageList'

function useChatMessages() {
  // Local state management using cache [solution #2]
  const { data, loading } = useQuery(messagesQuery)
  
  const messages = data ? data.messages : []

  useSubscription(messageAddedSubscription, {
    onSubscriptionData: result => {
      // write to cache so that we don't have to maintain local state
      result.client.writeData({ data: {
        // when we write data directly into the apollo cache, we should make 
        // sure the data has the same structure as in the query we used to retrieve that data
        messages: messages.concat(result.subscriptionData.data.messageAdded)
      }})
    }
  })

  const [addMessage, { loading: mutationLoading, error: mutationError, data: mutationData }] = useMutation(addMessageMutation)

  return {
    messages,
    addMessage: text => addMessage({ variables: { input: { text }}}),
    loading
  }
}


const Chat = ({ user }) => {
  // Local state management [solution #1]
  // const [messages, setMessages] = useState([])
  // useQuery(messagesQuery, {
  //   onCompleted: data => setMessages(data.messages)
  // })
  // useSubscription(messageAddedSubscription, {
  //   onSubscriptionData: result => {
  //    setMessages(messages.concat(result.subscriptionData.data.messageAdded))
  //   }
  // })

  const { messages, addMessage, loading } = useChatMessages()

  const handleSend = async text => {
    const { data } = await addMessage(text)
    console.log('mutation data: ', data)
  }

  if(loading) return <h1>Loading...</h1>

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Chatting as {user}</h1>
        <MessageList user={user} messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </section>
  )
}

// class Chat extends Component {
//   state = {messages: []}
//   subscription = null

//   async componentDidMount() {
//     const messages = await getMessages()
//     this.setState({messages})
//     this.subscription = onMessageAdded(message => {

//     subscription replaces the existing message if no query is present, therefore concat the result of subscription along with the query result
//      get the initial list of messages with the query first and then we use the subscription to receive additional messages that should be added to the list

//       this.setState({messages: this.state.messages.concat(message)})
//     })
//   }

//   componentWillUnmount() {
//     if(this.subscription) {
//       this.subscription.unsubscribe()
//     }
//   }

//   async handleSend(text) {
//     await addMessage(text)
//   }

//   render() {
//     const {user} = this.props
//     const {messages} = this.state
//     return (
//       <section className="section">
//         <div className="container">
//           <h1 className="title">Chatting as {user}</h1>
//           <MessageList user={user} messages={messages} />
//           <MessageInput onSend={this.handleSend.bind(this)} />
//         </div>
//       </section>
//     )
//   }  
// }

export default Chat
