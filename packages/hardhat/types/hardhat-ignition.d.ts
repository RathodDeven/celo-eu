declare module "@nomicfoundation/hardhat-ignition/modules" {
  export function buildModule(
    name: string,
    fn: (moduleBuilder: any) => { [key: string]: any }
  ): any
}

declare module "@nomicfoundation/hardhat-ignition/types" {
  export type IgnitionModule = any
}
