import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import { getAllProduct, productByPrice } from "../../admin/products/FetchApi";
import "./style.css";

const apiURL = process.env.REACT_APP_API_URL;

const ProductCategoryDropdown = () => {
  const history = useHistory();
  const { data, dispatch } = useContext(HomeContext);

  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(0);
  const [searchText, setSearchText] = useState("");

  // Fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategory();
        if (response && response.Categories) {
          setCategories(response.Categories);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchCategories();
  }, []);

  // Unified search handler
  const handleUnifiedSearch = async () => {
    dispatch({ type: "loading", payload: true });

    try {
      let response = await getAllProduct();
      let products = response?.Products || [];

      // Apply price filter
      if (priceRange && priceRange > 0) {
        products = products.filter((p) => Number(p.pPrice) <= Number(priceRange));
      }

      // Apply search filter
      if (searchText && searchText.trim() !== "") {
        products = products.filter((p) =>
          p.pName.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      dispatch({ type: "setProducts", payload: products });
    } catch (err) {
      console.log(err);
    }

    dispatch({ type: "loading", payload: false });
  };

  return (
    <Fragment>
      {/* Category List */}
      <div className={`${data.categoryListDropdown ? "" : "hidden"} my-4`}>
        <hr />
        <div className="py-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.length > 0 ? (
            categories.map((item, index) => (
              <div
                key={index}
                onClick={() => history.push(`/products/category/${item._id}`)}
                className="col-span-1 m-2 flex flex-col items-center justify-center space-y-2 cursor-pointer"
              >
                <img src={`${apiURL}/uploads/categories/${item.cImage}`} alt={item.cName} />
                <div className="font-medium">{item.cName}</div>
              </div>
            ))
          ) : (
            <div className="text-xl text-center my-4">No Category</div>
          )}
        </div>
      </div>

      {/* Price Filter */}
      <div className={`${data.filterListDropdown ? "" : "hidden"} my-4`}>
        <hr />
        <div className="w-full flex flex-col">
          <label className="text-sm font-medium py-2">
            Price (0 - 1000$): <span className="text-yellow-700">{priceRange}.00$</span>
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="slider"
          />
        </div>
      </div>

      {/* Search Input */}
      <div className={`${data.searchDropdown ? "" : "hidden"} my-4`}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search products..."
          className="px-4 py-2 border rounded w-full"
        />
      </div>

      {/* Unified Button */}
      <button
        onClick={handleUnifiedSearch}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg mt-4"
      >
        Apply Filter & Search
      </button>
    </Fragment>
  );
};

export default ProductCategoryDropdown;
