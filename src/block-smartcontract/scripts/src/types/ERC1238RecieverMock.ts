/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface ERC1238ReceiverMockInterface extends utils.Interface {
  functions: {
    "ERC1238_ON_BATCH_MINT()": FunctionFragment;
    "ERC1238_ON_MINT()": FunctionFragment;
    "onERC1238BatchMint(address,uint256[],uint256[],bytes)": FunctionFragment;
    "onERC1238Mint(address,uint256,uint256,bytes)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "ERC1238_ON_BATCH_MINT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "ERC1238_ON_MINT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1238BatchMint",
    values: [string, BigNumberish[], BigNumberish[], BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1238Mint",
    values: [string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "ERC1238_ON_BATCH_MINT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ERC1238_ON_MINT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC1238BatchMint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC1238Mint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ERC1238ReceiverMock extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ERC1238ReceiverMockInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    ERC1238_ON_BATCH_MINT(overrides?: CallOverrides): Promise<[string]>;

    ERC1238_ON_MINT(overrides?: CallOverrides): Promise<[string]>;

    onERC1238BatchMint(
      arg0: string,
      ids: BigNumberish[],
      arg2: BigNumberish[],
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    onERC1238Mint(
      arg0: string,
      id: BigNumberish,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;
  };

  ERC1238_ON_BATCH_MINT(overrides?: CallOverrides): Promise<string>;

  ERC1238_ON_MINT(overrides?: CallOverrides): Promise<string>;

  onERC1238BatchMint(
    arg0: string,
    ids: BigNumberish[],
    arg2: BigNumberish[],
    arg3: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  onERC1238Mint(
    arg0: string,
    id: BigNumberish,
    arg2: BigNumberish,
    arg3: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  callStatic: {
    ERC1238_ON_BATCH_MINT(overrides?: CallOverrides): Promise<string>;

    ERC1238_ON_MINT(overrides?: CallOverrides): Promise<string>;

    onERC1238BatchMint(
      arg0: string,
      ids: BigNumberish[],
      arg2: BigNumberish[],
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC1238Mint(
      arg0: string,
      id: BigNumberish,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    ERC1238_ON_BATCH_MINT(overrides?: CallOverrides): Promise<BigNumber>;

    ERC1238_ON_MINT(overrides?: CallOverrides): Promise<BigNumber>;

    onERC1238BatchMint(
      arg0: string,
      ids: BigNumberish[],
      arg2: BigNumberish[],
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    onERC1238Mint(
      arg0: string,
      id: BigNumberish,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ERC1238_ON_BATCH_MINT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ERC1238_ON_MINT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    onERC1238BatchMint(
      arg0: string,
      ids: BigNumberish[],
      arg2: BigNumberish[],
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    onERC1238Mint(
      arg0: string,
      id: BigNumberish,
      arg2: BigNumberish,
      arg3: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
