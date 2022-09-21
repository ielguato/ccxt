'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, InvalidOrder, AuthenticationError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class graviex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'graviex',
            'name': 'Graviex',
            'version': 'v3',
            'countries': [ 'MT', 'RU' ],
            'rateLimit': 300,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancellAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOcoOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradesHistory': true,
                'fetchWithdrawals': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://graviex.net//webapi/v3',
                    'private': 'https://graviex.net//webapi/v3',
                },
                'www': 'https://graviex.net',
                'doc': 'https://graviex.net/documents/api_v3',
                'fees': 'https://graviex.net/documents/fees-and-discounts',
            },
            'api': {
                // market: Unique market id. It's always in the form of xxxyyy, where xxx is the base currency code, yyy is the quote currency code, e.g. 'btccny'. All available markets can be found at /api/v2/markets.
                'public': {
                    'get': [
                        'timestamp',
                        'markets',
                        'tickers',
                        'depth', // Requires market XXXYYY. Optional: asks_limit, bids_limit.
                        'trades', // Requires market XXXYYY. Optional: limit, timestamp, from, to, order_by
                        'trades_simple', // Requires market XXXYYY.
                        'k', // Requires market XXXYYY. Optional: limit, timestamp, period
                        'k_with_pending_trades', // API endpoints exists almost same as k endpoint skipping for now.
                        'tickers/{market}', // Get ticker of specific market
                        'currency/info', // Not Using Currently In Unified Methods.
                    ],
                },
                'private': {
                    'get': [
                        'order_book', // Requires access_key, tonce, signature and market XXXYYY.
                        'members/me', // Requires access_key, tonce, signature and api secret.
                        'deposits', // Requires access_key, tonce, signature and api secret. Optional currency, limit and state.
                        'deposit', // Requires access_key, tonce, signature, txid and api secret.
                        'deposit_address', // Requires access_key, tonce, signature, currency and api secret.
                        'orders', // Requires access_key, tonce, signature and api secret. Optional market, state, limit, page, order_by
                        'order', // Requires access_key, tonce, signature and api secret AND id (unique orderid).
                        'trades/my', // Requires market XXXYYY, access_key, tonce, signature and api secret . Optional: limit, timestamp, from, to, order_by
                        'trades/history', // Requires market XXXYYY, access_key, tonce, signature and api secret . Optional: limit, timestamp, from, to, order_by
                        'orders/history', // Requires market XXXYYY, access_key, tonce, signature and api secret . Optional: limit, timestamp, from, to, order_by
                        'gen_deposit_address', // Requires access_key, tonce, signature, currency and api secret.
                        'account/settings', // Requires access_key, tonce, signature . Not Using Currently In Unified Methods.
                        'fund_sources', // Requires access_key, tonce, signature . Not Using Currently In Unified Methods.
                        'strategies/list', // Not Using Currently In Unified Methods.
                        'strategies/my', // Not Using Currently In Unified Methods.
                    ],
                    'post': [
                        'orders', // Requires access_key, tonce, signature and api secret AND market, side(sell/buy), volume. Optional price ord_type
                        'orders/multi', // Requires access_key, tonce, signature and api secret AND market, orders, orders[side(sell/buy)], orders[volume]. Optional orders[price], orders[ord_type]. To create multiple orders at once
                        'orders/clear', // Requires access_key, tonce, signature and api secret. Optional side(sell/buy) to only clear orders on one side.
                        'order/delete', // Requires access_key, tonce, signature and api secret AND id (unique orderid).
                        'account/store', // Not Using Currently In Unified Methods.
                        'create_fund_source', // Not Using Currently In Unified Methods.
                        'remove_funs_source', // Not Using Currently In Unified Methods.
                        'strategy/cancel', // Not Using Currently In Unified Methods.
                        'strategy/create', // Not Using Currently In Unified Methods.
                        'strategy/update', // Not Using Currently In Unified Methods.
                        'strategy/activate', // Not Using Currently In Unified Methods.
                        'strategy/deactivate', // Not Using Currently In Unified Methods.
                    ],
                },
            },
            'fees': {
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'exceptions': {
                'exact': {
                    '2002': InvalidOrder, // {"error":{"code":2002,"message":"Failed to create order. Reason: Volume is too small"}}
                    '1001': ExchangeError, // {"error":{"code":1001,"message":"market does not have a valid value"}}
                    '2008': AuthenticationError, // {"error":{"code":2008,"message":"The access key XXXXXXXXXXXXXXXXXXXX does not exist."}}
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTimestamp (params);
        // 1644821226
        return response;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets ();
        // {
        //     "id": "giobtc",
        //     "name": "GIO/BTC",
        // };
        const markets = response;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const symbol = this.safeString (market, 'name');
            const [ baseId, quoteId ] = symbol.split ('/');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': this.safeCurrencyCode (baseId),
                'quote': this.safeCurrencyCode (quoteId),
                'settle': undefined,
                'baseId': baseId.toLowerCase (),
                'quoteId': quoteId.toLowerCase (),
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': this.precision,
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "name": "GIO/BTC",
        //     "base_unit": "gio",
        //     "base_fixed": 4,
        //     "base_fee": 0.002,
        //     "quote_unit": "btc",
        //     "quote_fixed": 8,
        //     "quote_fee": 0.002,
        //     "api": true,
        //     "base_lot": null,
        //     "quote_lot": null,
        //     "base_min": "0.00000010",
        //     "quote_min": "0.00000010",
        //     "blocks": 260722,
        //     "block_time": "2022-01-31 14:10:08",
        //     "wstatus": "on",
        //     "low": "0.0000005",
        //     "high": "0.00000058",
        //     "last": "0.00000058",
        //     "open": "0.000000510",
        //     "volume": "70673.0412",
        //     "volume2": "0.03837782973",
        //     "sell": "0.00000058",
        //     "buy": "0.00000055",
        //     "at": 1643628427,
        // },
        const timestamp = this.safeTimestamp (ticker, 'at');
        const marketId = this.safeString (ticker, 'name');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'volume2'),
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTickersMarket (this.extend (request, params));
        // {
        //     "name": "GIO/BTC",
        //     "base_unit": "gio",
        //     "base_fixed": 4,
        //     "base_fee": 0.002,
        //     "quote_unit": "btc",
        //     "quote_fixed": 8,
        //     "quote_fee": 0.002,
        //     "api": true,
        //     "base_lot": null,
        //     "quote_lot": null,
        //     "base_min": "0.00000010",
        //     "quote_min": "0.00000010",
        //     "blocks": 260722,
        //     "block_time": "2022-01-31 14:10:08",
        //     "wstatus": "on",
        //     "low": "0.0000005",
        //     "high": "0.00000058",
        //     "last": "0.00000058",
        //     "open": "0.000000510",
        //     "volume": "70673.0412",
        //     "volume2": "0.03837782973",
        //     "sell": "0.00000058",
        //     "buy": "0.00000055",
        //     "at": 1643628427,
        // },
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        // {
        //   "giobtc": {
        //     "name": "GIO/BTC",
        //     "base_unit": "gio",
        //     "base_fixed": 4,
        //     "base_fee": 0.002,
        //     "quote_unit": "btc",
        //     "quote_fixed": 8,
        //     "quote_fee": 0.002,
        //     "api": true,
        //     "base_lot": null,
        //     "quote_lot": null,
        //     "base_min": "0.00000010",
        //     "quote_min": "0.00000010",
        //     "blocks": 260722,
        //     "block_time": "2022-01-31 14:10:08",
        //     "wstatus": "on",
        //     "low": "0.0000005",
        //     "high": "0.00000058",
        //     "last": "0.00000058",
        //     "open": "0.000000510",
        //     "volume": "70673.0412",
        //     "volume2": "0.03837782973",
        //     "sell": "0.00000057",
        //     "buy": "0.00000055",
        //     "at": 1643628325,
        //   },
        // },
        // const data = response;
        // let timestamp = data['at'];
        // let tickers = data['ticker'];
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        // {
        //     "id": 14473952,
        //     "at": 1643681026,
        //     "price": "0.00000056",
        //     "volume": "0.2",
        //     "funds": "0.000000112",
        //     "market": "giobtc",
        //     "created_at": "2022-02-01T05:03:46+03:00",
        //     "side": "sell"
        // },
        const price = this.safeString2 (trade, 'p', 'price');
        const amount = this.safeString2 (trade, 'volume', 'amount');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeTimestamp (trade, 'at');
        let id = this.safeString2 (trade, 't', 'a');
        id = this.safeString2 (trade, 'id', 'tid', id);
        const side = this.safeValue (trade, 'side');
        let takerOrMaker = undefined;
        const orderId = this.safeString (trade, 'id');
        if ('side' in trade) {
            if (side === 'buy') {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicGetTrades',
            'simple': 'publicGetTradesSimple',
        });
        if (limit !== undefined) {
            request['limit'] = limit; // default: 500
        }
        const response = await this[method] (this.extend (request, query));
        // [
        //     {
        //         "id": 14473952,
        //         "at": 1643681026,
        //         "price": "0.00000056",
        //         "volume": "0.2",
        //         "funds": "0.000000112",
        //         "market": "giobtc",
        //         "created_at": "2022-02-01T05:03:46+03:00",
        //         "side": "sell"
        //     },
        //     {
        //         "id": 14473615,
        //         "at": 1643670349,
        //         "price": "0.00000059",
        //         "volume": "515.0136",
        //         "funds": "0.000303858024",
        //         "market": "giobtc",
        //         "created_at": "2022-02-01T02:05:49+03:00",
        //         "side": "buy"
        //     },
        // ],
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetK (this.extend (request));
        // [
        //     [
        //         1643719320,
        //         6.5e-7,
        //         6.5e-7,
        //         6.5e-7,
        //         6.5e-7,
        //         0,
        //     ],
        //     [
        //         1643719380,
        //         6.5e-7,
        //         6.5e-7,
        //         6.5e-7,
        //         6.5e-7,
        //         0,
        //     ],
        // ],
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100,
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        // {
        //   "timestamp": 1643721617,
        //   "asks": [
        //     [
        //       "0.00000253",
        //       "120.0"
        //     ],
        //     [
        //       "0.0000025",
        //       "2424.0288"
        //     ],
        //     [
        //       "0.00000249",
        //       "77.577"
        //     ],
        //     [
        //       "0.00000248",
        //       "12.5"
        //     ],
        // },
        const timestamp = this.safeInteger (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, symbol, timestamp);
        return orderbook;
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'accounts_filtered');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetMembersMe (params);
        // {
        //     "sn": "GRAK6GDVXKNVIEX",
        //     "name": null,
        //     "email": "XXXXXXXXXXXXX",
        //     "activated": true,
        //     "verified": false,
        //     "accounts_filtered": [
        //     {
        //         "currency": "gio",
        //         "name": "GravioCoin",
        //         "balance": "0.0",
        //         "locked": "0.0",
        //         "status": "ok",
        //         "is_purged": false,
        //         "is_coin": true
        //     }
        //     ]
        // }
        return this.parseBalance (response);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        const code = (currency === undefined) ? undefined : currency['code'];
        const tag = undefined;
        this.checkAddress (depositAddress);
        return {
            'currency': code,
            'address': depositAddress,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        // "\"MJhWAUptMUrMo8Jb9G7xsPfSQjeWSWJh2q\""
        const parsedResponse = JSON.parse (response);
        return this.parseDepositAddress (parsedResponse, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        // [
        //     {
        //         "id": 4831985,
        //         "currency": "ltc",
        //         "amount": "0.14108256",
        //         "fee": "0.0",
        //         "txid": "c0d50a556a48e16f86b571651fd6199ce122ace9e2843e71e953b22db3eaf007",
        //         "uid": null,
        //         "created_at": "2022-02-01T18:10:32+03:00",
        //         "confirmations": "6",
        //         "done_at": null,
        //         "state": "accepted"
        //     }
        // ]
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'txid');
        const cancelRequested = this.safeValue (transaction, 'cancel_requested');
        const type = (cancelRequested === undefined) ? 'deposit' : 'withdrawal';
        const amount = this.safeNumber (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        let status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const statusCode = this.safeString (transaction, 'code');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        if (cancelRequested) {
            status = 'canceled';
        } else if (status === undefined) {
            status = this.parseTransactionStatus (statusCode);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'initiated': 'pending',
            'needs_create': 'pending',
            'credited': 'ok',
            'confirmed': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchDeposit (id, code = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposit() requires a txid argument');
        }
        await this.loadMarkets ();
        const request = {
            'txid': id,
        };
        const response = await this.privateGetDeposit (this.extend (request, params));
        // {
        //   "id": 4831985,
        //   "currency": "ltc",
        //   "amount": "0.14108256",
        //   "fee": "0.0",
        //   "txid": "c0d50a556a48e16f86b571651fd6199ce122ace9e2843e71e953b22db3eaf007",
        //   "uid": null,
        //   "created_at": "2022-02-01T18:10:32+03:00",
        //   "confirmations": "6",
        //   "done_at": null,
        //   "state": "accepted"
        // }
        // const data = this.safeValue (response, 'data', {});
        // const deposit = this.safeValue (data, 'deposit', {});
        return this.parseTransaction (response);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetDeposits (params);
        // const data = this.safeValue (response, 'data', {});
        // const deposits = this.safeValue (response);
        // [
        //     {
        //         "id": 4831985,
        //         "currency": "ltc",
        //         "amount": "0.14108256",
        //         "fee": "0.0",
        //         "txid": "c0d50a556a48e16f86b571651fd6199ce122ace9e2843e71e953b22db3eaf007",
        //         "uid": null,
        //         "created_at": "2022-02-01T18:10:32+03:00",
        //         "confirmations": "6",
        //         "done_at": null,
        //         "state": "accepted"
        //     }
        // ]
        return this.parseTransactions (response, currency, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'wait',
            'CANCELED': 'cancel',
            'FILLED': 'done',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //   {
        //     "id": 287792646,
        //     "at": 1643956089,
        //     "side": "sell",
        //     "ord_type": "limit",
        //     "price": "0.141",
        //     "avg_price": "0.0",
        //     "state": "cancel",
        //     "market": "ltcbtc",
        //     "created_at": "2022-02-04T09:28:09+03:00",
        //     "volume": "0.141",
        //     "remaining_volume": "0.141",
        //     "executed_volume": "0.0",
        //     "trades_count": 0,
        //     "strategy": null
        //   }
        const id = this.safeString (order, 'id');
        const timestamp = this.safeTimestamp (order, 'at');
        const sideType = this.safeString (order, 'ord_type');
        const side = this.safeString (order, 'side');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'avg_price');
        const remaining = this.safeString (order, 'remaining_volume');
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const rawTrades = this.safeValue (order, 'trades', []);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': sideType,
            'side': side,
            'price': price,
            'amount': amount,
            'remaining': remaining,
            'status': status,
            'trades': rawTrades,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        // {
        //   "id": 288336422,
        //   "at": 1644217763,
        //   "side": "sell",
        //   "ord_type": "limit",
        //   "price": "0.141",
        //   "avg_price": "0.0",
        //   "state": "wait",
        //   "market": "ltcbtc",
        //   "created_at": "2022-02-07T10:09:23+03:00",
        //   "volume": "0.141",
        //   "remaining_volume": "0.141",
        //   "executed_volume": "0.0",
        //   "trades_count": 0,
        //   "trades": [],
        //   "strategy": null
        // }
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'desc': true,
        };
        let market = undefined;
        const numericId = this.safeValue (params, 'market_id');
        if (numericId !== undefined) {
            request['market'] = numericId; // mutually exclusive with market_string
        } else if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTradesHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'order_by': 'desc',
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default: 500
        }
        const response = await this.privateGetTradesHistory (this.extend (request));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'volume': this.amountToPrecision (symbol, amount),
            'ord_type': type,
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request));
        // {
        //   "id": 288336422,
        //   "at": 1644217763,
        //   "side": "sell",
        //   "ord_type": "limit",
        //   "price": "0.141",
        //   "avg_price": "0.0",
        //   "state": "wait",
        //   "market": "ltcbtc",
        //   "created_at": "2022-02-07T10:09:23+03:00",
        //   "volume": "0.141",
        //   "remaining_volume": "0.141",
        //   "executed_volume": "0.0",
        //   "trades_count": 0,
        //   "strategy": null
        // }
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a side argument');
        }
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderDelete (this.extend (request, params));
        // {
        //   "id": 288336422,
        //   "at": 1644217763,
        //   "side": "sell",
        //   "ord_type": "limit",
        //   "price": "0.141",
        //   "avg_price": "0.0",
        //   "state": "wait",
        //   "market": "ltcbtc",
        //   "created_at": "2022-02-07T10:09:23+03:00",
        //   "volume": "0.141",
        //   "remaining_volume": "0.141",
        //   "executed_volume": "0.0",
        //   "trades_count": 0,
        //   "trades": [],
        //   "strategy": null
        // }
        const order = this.parseOrder (response);
        return order;
    }

    async cancellAllOrders (side = undefined, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
        };
        if (side !== undefined) {
            request['side'] = side;
        }
        const response = await this.privatePostOrdersClear (this.extend (request, params));
        const order = this.parseOrder (response);
        return order;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_by': 'desc',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default: 500
        }
        const response = await this.privateGetOrdersHistory (this.extend (request, params));
        // [
        //   {
        //     "id": 287792646,
        //     "at": 1643956089,
        //     "side": "sell",
        //     "ord_type": "limit",
        //     "price": "0.141",
        //     "avg_price": "0.0",
        //     "state": "cancel",
        //     "market": "ltcbtc",
        //     "created_at": "2022-02-04T09:28:09+03:00",
        //     "volume": "0.141",
        //     "remaining_volume": "0.141",
        //     "executed_volume": "0.0",
        //     "trades_count": 0,
        //     "strategy": null
        //   }
        // ]
        return this.parseOrders (response, market, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetGenDepositAddress (this.extend (request, params));
        // "\"request_accepted\""
        const parsedResponse = JSON.parse (response);
        return this.parseDepositAddress (parsedResponse, currency);
    }

    nonce () {
        return this.milliseconds ();
    }

    encodeParams (params) {
        return this.urlencode (this.keysort (params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        const request = '/webapi/v3/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public' && path === 'tickers/{market}') {
            url = this.urls['api'][api] + this.implodeParams (path, params);
        } else if (api === 'public' && path !== 'tickers/{market}') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const query = this.encodeParams (this.extend ({
                'access_key': this.apiKey,
                'tonce': nonce,
            }, params));
            const payload = method + '|' + request + '|' + query;
            const signed = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256');
            const suffix = query + '&signature=' + signed;
            if (method === 'GET') {
                url += '?' + suffix;
            } else {
                body = suffix;
                headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const error = this.safeValue (response, 'error');
        const errorCode = this.safeString (error, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
    }
};