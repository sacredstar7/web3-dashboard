import { SearchForm } from "../SearchForm"
import { useEffect, useState } from "react";
import tokenList from "../../assets/tokens/tokens.json";
import { TokenInfo } from "../../interfaces/token/token.interface";

export type SearchProps = {
    onItemSearch: (object) => void;
    className?: string;
}

export const TokenInfokSearch = ({ onItemSearch, className }: SearchProps) => {
    const [ tokens, setTokens ] = useState([]);
    const [searchResults, setSearchResults] = useState([] as any[]);

    useEffect(() => {
        setTokens(Object.keys(tokenList).map((key) => {
            return { name: key, ...tokenList[key]}
        }))
    }, [])

    const filterResults = (keyword: string) => {
        const filteredTokens = tokens
            .filter((token: TokenInfo) => token.name.toString().toLowerCase().includes(keyword.toLowerCase()) || token.address.toLowerCase().includes(keyword.toLowerCase()) || token.symbol.toLowerCase().includes(keyword.toLowerCase()))

        setSearchResults([...filteredTokens]);
    }

    const handleSearch = (keyword: string) => {
        if (keyword.length < 1) {
            setSearchResults([]);
            return;
        }

        filterResults(keyword);
    }

    const handleTokenClick = (token: TokenInfo) => (event) => {
        setSearchResults([]);
        onItemSearch(token);
    }

    return (
        <>
            <SearchForm className={ className || "z-30"} placeholder={"Search name, symbol, address..."} onSearch={handleSearch} onType={handleSearch} onSearchRemoved={() => { setSearchResults([]) }} />
            {
                searchResults.length > 0 ?
                    <div className='light-card rounded-b-2xl p-4 shadow-lg mx-auto flex flex-col space-y-4 absolute z-20 pt-16 w-full'>
                        {
                            searchResults.filter((r, i) => i < 10).map((r: any, i) => (
                                <p key={"results-" + i} className="cursor-pointer" onClick={handleTokenClick(r)}>{r.name + (!r.name.includes(r.symbol) ? " ("+ r.symbol +")" : "" )}</p>
                            ))
                        }
                    </div>
                    : null
            }
        </>
    )
}