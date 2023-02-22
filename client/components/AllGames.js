import React from "react";
import { Form, Button, Table, Container, Row, Col } from "react-bootstrap";
import { tictactoe_abi, tictactoe_bytecode, registry_abi, registry_address } from "../lib/contract_config";
import { ethers, BigNumber } from "ethers";
import { useEffect, useState } from "react";
import truncateEthAddress from "truncate-eth-address";
import { useWeb3React } from "@web3-react/core";

export function AllGames({ selectedGameFunc }) {
	const [games, setGames] = useState([]);
	const [selectedGame, setSelectedGame] = useState(null);
	const { account } = useWeb3React();

	const findGames = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				let registry_contract = new ethers.Contract(registry_address, registry_abi, signer);
				if (account) {
					console.log("Calling for address = ", account);
					let tx = await registry_contract.getGameList(account);
					console.log("List of games = ", tx);
					setGames(tx);
				}
			}
		} catch (e) {
			console.log("Error while finding games", e);
		}
	};

	const setGame = async (event) => {
		console.log("Choosing the game = ", event.target.dataset.id);
		const selectedGameContract = event.target.dataset.id;
		let gameBoardState;
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				let gameContractObj = new ethers.Contract(selectedGameContract, tictactoe_abi, signer);
				if (account) {
					let tx = await gameContractObj.getGame();
					console.log("Game state = ", tx.toString());
					gameBoardState = tx.toString();
				}
			}
		} catch (e) {
			console.log("Error while finding games", e);
		}
		const gameObject = {
			gameContract: event.target.dataset.id,
			gameBoard: gameBoardState,
		};
		selectedGameFunc(gameObject);
	};

	useEffect(() => {
		findGames();
	}, [account]);
	return (
		<>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>#</th>
						<th>First Player</th>
						<th>Second Player</th>
						<th>Game Contract</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{games.map((item, index) => (
						<tr key={index}>
							<td>{index}</td>
							<td>{truncateEthAddress(item[0])}</td>
							<td>{truncateEthAddress(item[1])}</td>
							<td>{truncateEthAddress(item[2])}</td>
							<td>
								<Button variant="outline-primary" size="sm" data-id={item[2]} onClick={setGame} type="submit">
									Choose
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	);
}