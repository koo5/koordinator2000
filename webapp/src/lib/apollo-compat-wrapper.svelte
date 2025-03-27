<script>
  /**
   * Improved compatibility wrapper for svelte-apollo to work with Svelte 5
   * This avoids direct imports from svelte-apollo which uses the old Svelte 4 internals
   */
  import { getContext, onDestroy, setContext } from 'svelte';
  import { readable, writable } from 'svelte/store';
  
  // Store for Apollo client
  const APOLLO = Symbol('apollo');
  
  // Get client from context
  export function getClient() {
    return getContext(APOLLO);
  }
  
  // Set client to context
  export function setClient(client) {
    return setContext(APOLLO, client);
  }
  
  // Subscription function (used by apollo.js)
  export function subscribe(queryObj, options = {}) {
    return query(queryObj, options);
  }
  
  // Create a query store
  export function query(queryObj) {
    const client = getClient();
    const store = writable({ loading: true });
    let subscription;
    
    const execute = (variables) => {
      if (subscription) {
        subscription.unsubscribe();
      }
      
      store.set({ loading: true });
      
      const watchQueryOptions = {
        query: queryObj,
        variables,
        fetchPolicy: 'network-only',
      };
      
      const observable = client.watchQuery(watchQueryOptions);
      
      subscription = observable.subscribe({
        next: (result) => {
          store.set(result);
        },
        error: (error) => {
          store.set({ loading: false, error });
          console.error('Query error:', error);
        }
      });
      
      return {
        refetch: (newVariables) => {
          return execute(newVariables || variables);
        }
      };
    };
    
    const initialOptions = queryObj.variables || {};
    const initialResult = execute(initialOptions);
    
    // Add refetch method
    store.refetch = initialResult.refetch;
    
    return store;
  }
  
  // Create a mutation function
  export function mutation(mutationObj) {
    const client = getClient();
    
    return (options = {}) => {
      return client.mutate({
        mutation: mutationObj,
        ...options
      }).catch(error => {
        console.error('Mutation error:', error);
        throw error;
      });
    };
  }
  
  // Create a subscription store
  export function subscription(subscriptionObj, options = {}) {
    const client = getClient();
    const store = writable({ loading: true });
    
    const observable = client.subscribe({
      query: subscriptionObj,
      variables: options.variables
    });
    
    const subscription = observable.subscribe({
      next: result => store.set(result),
      error: error => {
        store.set({ loading: false, error });
        console.error('Subscription error:', error);
      }
    });
    
    onDestroy(() => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
    
    return store;
  }
  
  /**
   * Apollo Provider component 
   */
  export function ApolloProvider({ client }) {
    setClient(client);
    
    onDestroy(() => {
      // No cleanup needed
    });
  }
</script>

<slot />