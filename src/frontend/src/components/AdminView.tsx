import { ADMIN_USER_ADDRESS, defaultSnapOrigin, PRESI_SIM_TOKEN_CONTRACT } from '@/config/snap'
import { MetaMaskContext } from '@/hooks/MetamaskContext'
import { fetchWinner } from '@/services'
import { concat, FunctionFragment, hexlify } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useToast } from './ui/use-toast'

const AdminView = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [state] = useContext(MetaMaskContext)

  const { toast } = useToast();

  useEffect(() => {
    if (state.selectedAcount) {
      const loadData = async () => {
        const winner = fetchWinner();
        console.log(`gameOver`, gameOver)
        if (!!winner) {
          setGameOver(true)
        }
      }
      loadData();
    }
  }, [state.selectedAcount]);

  const onNewGame = async () => {
    try {

      if (!state.selectedAcount || Number(state.chain) !== 28882) {
        console.log(`account not connected`)
        return;
      }

      setLoading(true);
      const funcSelector = FunctionFragment.getSelector("getDailyQuestion");

      const txData = hexlify(concat([funcSelector]));

      const transactionDetails = {
        payload: {
          to: PRESI_SIM_TOKEN_CONTRACT,
          value: '0',
          data: txData,
        },
        account: state.selectedAcount.id,
        scope: `eip155:${state.chain}`,
      };

      const txResponse = await window.ethereum?.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: 'eth_sendUserOpBoba', // operation to send the data to bundler
            params: [transactionDetails],
            id: state.selectedAcount?.id,
          },
        },
      })
      console.log(`game creation txResponse`, txResponse);

      toast({
        title: '✅ Game Creation success!'
      })
      setLoading(false);
    } catch (error) {
      console.log(`error while creation`, error);
      toast({
        title: "Uh oh! Something went wrong.",
      })
      setLoading(false);
    }

  }

  const onSelectBestAnswer = async () => {
    try {
      if (!state.selectedAcount || Number(state.chain) !== 28882) {
        console.log(`account not connected`)
        return;
      }

      setLoading(true);

      const funcSelector = FunctionFragment.getSelector("submitResults");

      const txData = hexlify(concat([funcSelector]));

      const transactionDetails = {
        payload: {
          to: PRESI_SIM_TOKEN_CONTRACT,
          value: '0',
          data: txData,
        },
        account: state.selectedAcount.id,
        scope: `eip155:${state.chain}`,
      };

      const txResponse = await window.ethereum?.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: 'eth_sendUserOpBoba', // operation to send the data to bundler
            params: [transactionDetails],
            id: state.selectedAcount?.id,
          },
        },
      })
      console.log(`Best has answer selection response`, txResponse);
      toast({
        title: '✅ Best Answer Selected!'
      })
      setLoading(false);
    } catch (error) {
      console.log(`error while creation`, error);
      toast({
        title: "Uh oh! Something went wrong.",
      })
      setLoading(false);
    }
  }

  if (state.selectedAcount?.address !== ADMIN_USER_ADDRESS) {
    return <></>
  }

  return (
    <Card className='w-6/12 m-auto my-2'>
      <CardHeader className="">
        <CardTitle className="w-2/12 mx-auto text-4xl hove̦r:italic">
          🔒
        </CardTitle>
        <CardDescription className="text-md italic">Admin use only!</CardDescription>
      </CardHeader>
      <CardContent className="flex w-10/12 gap-2 mx-auto">
        <Button
          disabled={!gameOver || loading}
          onClick={onNewGame} className="w-full" variant="outline">New Game</Button>
        <Button
          disabled={loading}
          onClick={onSelectBestAnswer} className="w-full" variant="destructive">Select Best Answer</Button>
      </CardContent>
    </Card>
  )
}

export default AdminView