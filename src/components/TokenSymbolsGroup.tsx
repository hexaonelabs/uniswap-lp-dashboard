
export const TokenSymbolsGroup = ({ tokens }: {
  tokens: {
    token0: { logoURI: string; symbol: string };
    token1: { logoURI: string; symbol: string };
  }
}) => {
  return (
    <div className="flex items-center flex-shrink-0">
      <div className="relative w-20 h-12">
        <img
          src={tokens.token0.logoURI}
          alt={tokens.token0.symbol}
          className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
        />
        <img
          src={tokens.token1.logoURI}
          alt={tokens.token1.symbol}
          className="w-12 h-12 rounded-full border-2 border-white shadow-lg absolute top-0 right-0"
        />
      </div>
    </div>
  );
};
