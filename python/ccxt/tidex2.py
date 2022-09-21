# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

from ccxt.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import AuthenticationError


class tidex2(Exchange):

    def describe(self):
        return self.deep_extend(super(tidex2, self).describe(), {
            'id': 'tidex2',
            'name': 'Tidex',
            'countries': ['UK'],
            'rateLimit': 2000,
            'version': '3',
            'userAgent': None,
            'has': {
                'CORS': False,
                'spot': True,
                'margin': False,
                'swap': False,
                'future': False,
                'option': False,
                'addMargin': False,
                'cancelOrder': True,
                'createMarketOrder': None,
                'createOrder': True,
                'createReduceOnlyOrder': False,
                'fetchBalance': True,
                'fetchBorrowRate': False,
                'fetchBorrowRateHistories': False,
                'fetchBorrowRateHistory': False,
                'fetchBorrowRates': False,
                'fetchBorrowRatesPerSymbol': False,
                'fetchCurrencies': True,
                'fetchFundingHistory': False,
                'fetchFundingRate': False,
                'fetchFundingRateHistory': False,
                'fetchFundingRates': False,
                'fetchIndexOHLCV': False,
                'fetchIsolatedPositions': False,
                'fetchLeverage': False,
                'fetchLeverageTiers': False,
                'fetchMarkets': True,
                'fetchMarkOHLCV': False,
                'fetchMyTrades': True,
                'fetchOHLCV': True,
                'fetchOpenOrders': True,
                'fetchOrder': True,
                'fetchOrderBook': True,
                'fetchOrderBooks': False,
                'fetchPosition': False,
                'fetchPositions': False,
                'fetchPositionsRisk': False,
                'fetchPremiumIndexOHLCV': False,
                'fetchTicker': True,
                'fetchTickers': True,
                'fetchTrades': True,
                'reduceMargin': False,
                'setLeverage': False,
                'setMarginMode': False,
                'setPositionMode': False,
                'withdraw': True,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api': {
                    'web': 'https://gate.tidex.com/api',
                    'public': 'https://api.tidex.com/api/v1/public',
                    'private': 'https://api.tidex.com/api/v1',
                },
                'www': 'https://tidex.com',
                'doc': 'https://gitlab.com/tidex/api/-/blob/main/tidex_doc.md',
                'referral': 'https://tidex.com/exchange/?ref=57f5638d9cd7',
                'fees': [
                    'https://tidex.com/fee-schedule',
                ],
            },
            'timeframes': {
                '15s': '15',
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
                '3d': '259200',
                '1w': '604800',
            },
            'api': {
                'web': {
                    'get': [
                        'currency',
                    ],
                },
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history/result',
                        'symbols',
                        'depth/result',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'account/balances',
                        'account/balance',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': False,
                    'percentage': True,
                    'taker': self.parse_number('0.002'),
                    'maker': self.parse_number('0.002'),
                },
            },
            'commonCurrencies': {
                'DSH': 'DASH',
                'EMGO': 'MGO',
                'MGO': 'WMGO',
            },
            'requiredCredentials': {
                'apiKey': True,
                'secret': True,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                    'Api key header is missing!': AuthenticationError,  # {"code":0,"success":false,"message":"Api key header is missing!","result":[]}
                },
            },
            'options': {
                'fetchTickersMaxLength': 1000,
            },
            'orders': {},  # orders cache / emulation
        })

    def fetch_currencies(self, params={}):
        response = self.webGetCurrency(params)
        #
        #     [
        #         {
        #             "id":2,
        #             "symbol":"BTC",
        #             "type":2,
        #             "name":"Bitcoin",
        #             "amountPoint":8,
        #             "depositEnable":true,
        #             "depositMinAmount":0.0005,
        #             "withdrawEnable":true,
        #             "withdrawFee":0.0004,
        #             "withdrawMinAmount":0.0005,
        #             "settings":{
        #                 "Blockchain":"https://blockchair.com/bitcoin/",
        #                 "TxUrl":"https://blockchair.com/bitcoin/transaction/{0}",
        #                 "AddrUrl":"https://blockchair.com/bitcoin/address/{0}",
        #                 "ConfirmationCount":3,
        #                 "NeedMemo":false,
        #                 "ManuallyWithdraw":false
        #             },
        #             "visible":true,
        #             "isDelisted":false
        #         }
        #     ]
        #
        result = {}
        for i in range(0, len(response)):
            currency = response[i]
            id = self.safe_string(currency, 'symbol')
            precision = self.safe_integer(currency, 'amountPoint')
            code = self.safe_currency_code(id)
            active = self.safe_value(currency, 'visible')
            withdrawEnable = self.safe_value(currency, 'withdrawEnable')
            depositEnable = self.safe_value(currency, 'depositEnable')
            name = self.safe_string(currency, 'name')
            fee = self.safe_number(currency, 'withdrawFee')
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'deposit': depositEnable,
                'withdraw': withdrawEnable,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': None,
                        'max': None,
                    },
                    'withdraw': {
                        'min': self.safe_number(currency, 'withdrawMinAmount'),
                        'max': None,
                    },
                    'deposit': {
                        'min': self.safe_number(currency, 'depositMinAmount'),
                        'max': None,
                    },
                    'price': {
                        'min': None,
                        'max': None,
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                },
                'fee': fee,
                'info': currency,
            }
        return result

    def fetch_markets(self, params={}):
        response = self.publicGetMarkets(params)
        markets = self.safe_value(response, 'result')
        #
        #     {
        #         "code":200,
        #         "success":true,
        #         "message":"",
        #         "result":[
        #             {
        #                 "name":"BCH_BTC",
        #                 "moneyPrec":8,
        #                 "stock":"BCH",
        #                 "money":"BTC",
        #                 "stockPrec":8,
        #                 "feePrec":8,
        #                 "minAmount":"0.001"
        #             }
        #         ]
        #     }
        #
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = self.safe_string(market, 'name')
            baseId, quoteId = id.split('_')
            base = self.safe_currency_code(baseId)
            quote = self.safe_currency_code(quoteId)
            precision = {
                'amount': None,
                'price': self.safe_integer(market, 'moneyPrec'),
            }
            result.append({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': None,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': None,
                'type': 'spot',
                'spot': True,
                'margin': False,
                'swap': False,
                'future': False,
                'option': False,
                'active': None,
                'contract': False,
                'linear': None,
                'inverse': None,
                'taker': None,
                'contractSize': None,
                'expiry': None,
                'expiryDatetime': None,
                'strike': None,
                'optionType': None,
                'precision': precision,
                'limits': {
                    'leverage': {
                        'min': None,
                        'max': None,
                    },
                    'amount': {
                        'min': self.safe_number(market, 'minAmount'),
                        'max': None,
                    },
                    'price': {
                        'min': None,
                        'max': None,
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                },
                'info': market,
            })
        return result

    def parse_ticker(self, ticker, market=None):
        #
        # fetchTicker
        #     {
        #         "name":"YFI_USDT",
        #         "bid":"21607.842223",
        #         "ask":"21635.50514299",
        #         "open":"21530.31",
        #         "high":"22619.38",
        #         "low":"21193.59",
        #         "last":"21644.23",
        #         "volume":"188.4555124",
        #         "deal":"4075612.142786252",
        #         "change":"1"
        #     }
        #
        # fetchTickers
        #     {
        #         "at":1646289676,
        #         "ticker":{
        #             "name":"yfi_usdt",
        #             "bid":"21937.47155034",
        #             "ask":"21966.13380147",
        #             "open":"21449.08",
        #             "high":"22619.38",
        #             "low":"21193.59",
        #             "last":"21968.03",
        #             "vol":"188.4452385",
        #             "deal":"4075398.065557751",
        #             "change":"2"
        #         }
        #     }
        #
        timestamp = self.safe_timestamp(ticker, 'at')
        if timestamp is not None:
            ticker = self.safe_value(ticker, 'ticker')
        marketId = self.safe_string_upper(ticker, 'name')
        symbol = self.safe_symbol(marketId, market)
        last = self.safe_string(ticker, 'last')
        return self.safe_ticker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_string(ticker, 'high'),
            'low': self.safe_string(ticker, 'low'),
            'bid': self.safe_string(ticker, 'buy'),
            'bidVolume': None,
            'ask': self.safe_string(ticker, 'sell'),
            'askVolume': None,
            'vwap': None,
            'open': None,
            'close': last,
            'last': last,
            'previousClose': None,
            'change': None,
            'percentage': None,
            'average': self.safe_string(ticker, 'avg'),
            'baseVolume': self.safe_string(ticker, 'vol_cur'),
            'quoteVolume': self.safe_string(ticker, 'vol'),
            'info': ticker,
        }, market, False)

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        response = self.publicGetTickers(params)
        result = self.safe_value(response, 'result')
        #
        #     {
        #         "code":200,
        #         "success":true,
        #         "message":"",
        #         "result":{
        #             "YFI_USDT":{
        #                 "at":1646289676,
        #                 "ticker":{
        #                     "name":"yfi_usdt",
        #                     "bid":"21937.47155034",
        #                     "ask":"21966.13380147",
        #                     "open":"21449.08",
        #                     "high":"22619.38",
        #                     "low":"21193.59",
        #                     "last":"21968.03",
        #                     "vol":"188.4452385",
        #                     "deal":"4075398.065557751",
        #                     "change":"2"
        #                 }
        #             }
        #         }
        #     }
        #
        return self.parse_tickers(result, symbols)

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'market': market['id'],
        }
        response = self.publicGetTicker(self.extend(request, params))
        result = self.safe_value(response, 'result')
        #
        #     {
        #         "code":200,
        #         "success":true,
        #         "message":"",
        #         "result":{
        #             "name":"YFI_USDT",
        #             "bid":"21607.842223",
        #             "ask":"21635.50514299",
        #             "open":"21530.31",
        #             "high":"22619.38",
        #             "low":"21193.59",
        #             "last":"21644.23",
        #             "volume":"188.4555124",
        #             "deal":"4075612.142786252",
        #             "change":"1"
        #         }
        #     }
        #
        return self.parse_ticker(result, market)

    def fetch_order_book(self, symbol, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'market': market['id'],
        }
        if limit is not None:
            request['limit'] = limit  # default = 1, max = 100
        response = self.publicGetDepthResult(self.extend(request, params))
        #
        #     {
        #         "asks":[
        #             ["22064.13194312","0.25742"],
        #         ],
        #         "bids":[
        #             ["22017.12205596","0.11"],
        #         ]
        #     }
        #
        return self.parse_order_book(response, symbol)

    def parse_trade(self, trade, market=None):
        # fetchTrades
        #     {
        #         "tid":135762344,
        #         "date":1646294384,
        #         "price":"21991.91",
        #         "type":"buy",
        #         "amount":"0.0024",
        #         "total":"52.780584"
        #     }
        #
        timestamp = self.safe_timestamp(trade, 'date')
        side = self.safe_string(trade, 'type')
        price = self.safe_string(trade, 'price')
        amount = self.safe_string(trade, 'amount')
        id = self.safe_string(trade, 'tid')
        symbol = self.safe_symbol(None, market)
        return self.safe_trade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'order': None,
            'type': None,
            'takerOrMaker': None,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': None,
            'fee': None,
        }, market)

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        if since is None:
            since = 1
        market = self.market(symbol)
        request = {
            'market': market['id'],
            'since': since,  # Min 1; Market History Since Selected tid
        }
        if limit is not None:
            request['limit'] = limit  # Default 50; min 1; max 1000
        response = self.publicGetHistoryResult(self.extend(request, params))
        #
        #     [
        #         {
        #             "tid":135762344,
        #             "date":1646294384,
        #             "price":"21991.91",
        #             "type":"buy",
        #             "amount":"0.0024",
        #             "total":"52.780584"
        #         }
        #     ]
        #
        return self.parse_trades(response, market, since, limit)

    def parse_ohlcv(self, ohlcv, market=None):
        #
        #     {
        #         "time":1646205840,
        #         "open":"21290.48",
        #         "close":"21290.48",
        #         "highest":"21290.48",
        #         "lowest":"21290.48",
        #         "volume":"0",
        #         "amount":"0",
        #         "market":"YFI_USDT"
        #     }
        #
        return [
            self.safe_timestamp(ohlcv, 'time'),
            self.safe_number(ohlcv, 'open'),
            self.safe_number(ohlcv, 'highest'),
            self.safe_number(ohlcv, 'lowest'),
            self.safe_number(ohlcv, 'close'),
            self.safe_number(ohlcv, 'volume'),
        ]

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'interval': self.timeframes[timeframe],
            'market': market['id'],
        }
        limit = 1501 if (limit is None) else limit
        if since is None:
            request['end'] = self.seconds()
            request['start'] = request['end'] - limit * self.parse_timeframe(timeframe)
        else:
            request['start'] = int(since / 1000)
            request['end'] = self.sum(request['start'], limit * self.parse_timeframe(timeframe))
        response = self.publicGetKline(self.extend(request, params))
        result = self.safe_value(response, 'result', {})
        kline = self.safe_value(result, 'kline', [])
        #
        #     {
        #         "code":200,
        #         "success":true,
        #         "message":"",
        #         "result":{
        #             "market":"YFI_USDT",
        #             "start":1646205797,
        #             "end":1646295857,
        #             "interval":60,
        #             "kline":[
        #                 {
        #                     "time":1646205840,
        #                     "open":"21290.48",
        #                     "close":"21290.48",
        #                     "highest":"21290.48",
        #                     "lowest":"21290.48",
        #                     "volume":"0",
        #                     "amount":"0",
        #                     "market":"YFI_USDT"
        #                 }
        #             ]
        #         }
        #     }
        #
        return self.parse_ohlcvs(kline, market, timeframe, since, limit)

    def parse_balance(self, response):
        balances = self.safe_value(response, 'return')
        timestamp = self.safe_timestamp(balances, 'server_time')
        result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
        }
        funds = self.safe_value(balances, 'funds', {})
        currencyIds = list(funds.keys())
        for i in range(0, len(currencyIds)):
            currencyId = currencyIds[i]
            code = self.safe_currency_code(currencyId)
            balance = self.safe_value(funds, currencyId, {})
            account = self.account()
            account['free'] = self.safe_string(balance, 'value')
            account['used'] = self.safe_string(balance, 'inOrders')
            result[code] = account
        return self.safe_balance(result)

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privatePostAccountBalances(params)
        #
        #     {
        #         "success":1,
        #         "return":{
        #             "funds":{
        #                 "btc":{"value":0.0000499885629956,"inOrders":0.0},
        #                 "eth":{"value":0.000000030741708,"inOrders":0.0},
        #                 "tdx":{"value":0.0000000155385356,"inOrders":0.0}
        #             },
        #             "rights":{
        #                 "info":true,
        #                 "trade":true,
        #                 "withdraw":false
        #             },
        #             "transaction_count":0,
        #             "open_orders":0,
        #             "server_time":1619436907
        #         },
        #         "stat":{
        #             "isSuccess":true,
        #             "serverTime":"00:00:00.0001157",
        #             "time":"00:00:00.0101364",
        #             "errors":null
        #         }
        #     }
        #
        return self.parse_balance(response)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type == 'market':
            raise ExchangeError(self.id + ' allows limit orders only')
        amountString = str(amount)
        priceString = str(price)
        self.load_markets()
        market = self.market(symbol)
        request = {
            'pair': market['id'],
            'type': side,
            'amount': self.amount_to_precision(symbol, amount),
            'rate': self.price_to_precision(symbol, price),
        }
        response = self.privatePostTrade(self.extend(request, params))
        id = None
        status = 'open'
        filledString = '0.0'
        remainingString = amountString
        returnResult = self.safe_value(response, 'return')
        if returnResult is not None:
            id = self.safe_string(returnResult, 'order_id')
            if id == '0':
                id = self.safe_string(returnResult, 'init_order_id')
                status = 'closed'
            filledString = self.safe_string(returnResult, 'received', filledString)
            remainingString = self.safe_string(returnResult, 'remains', amountString)
        timestamp = self.milliseconds()
        return self.safe_order({
            'id': id,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'lastTradeTimestamp': None,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': priceString,
            'cost': None,
            'amount': amountString,
            'remaining': remainingString,
            'filled': filledString,
            'fee': None,
            # 'trades': self.parse_trades(order['trades'], market),
            'info': response,
            'clientOrderId': None,
            'average': None,
            'trades': None,
        }, market)

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        request = {
            'order_id': int(id),
        }
        return self.privatePostCancelOrder(self.extend(request, params))

    def parse_order_status(self, status):
        statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'canceled',  # or partially-filled and still open? https://github.com/ccxt/ccxt/issues/1594
        }
        return self.safe_string(statuses, status, status)

    def parse_order(self, order, market=None):
        id = self.safe_string(order, 'id')
        status = self.parse_order_status(self.safe_string(order, 'status'))
        timestamp = self.safe_timestamp(order, 'timestamp_created')
        marketId = self.safe_string(order, 'pair')
        symbol = self.safe_symbol(marketId, market)
        remaining = None
        amount = None
        price = self.safe_string(order, 'rate')
        if 'start_amount' in order:
            amount = self.safe_string(order, 'start_amount')
            remaining = self.safe_string(order, 'amount')
        else:
            remaining = self.safe_string(order, 'amount')
        fee = None
        return self.safe_order({
            'info': order,
            'id': id,
            'clientOrderId': None,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'lastTradeTimestamp': None,
            'type': 'limit',
            'timeInForce': None,
            'postOnly': None,
            'side': self.safe_string(order, 'type'),
            'price': price,
            'stopPrice': None,
            'cost': None,
            'amount': amount,
            'remaining': remaining,
            'filled': None,
            'status': status,
            'fee': fee,
            'average': None,
            'trades': None,
        }, market)

    def fetch_order(self, id, symbol=None, params={}):
        self.load_markets()
        request = {
            'order_id': int(id),
        }
        response = self.privatePostOrderInfo(self.extend(request, params))
        id = str(id)
        result = self.safe_value(response, 'return', {})
        order = self.safe_value(result, id)
        return self.parse_order(self.extend({'id': id}, order))

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        request = {}
        market = None
        if symbol is not None:
            market = self.market(symbol)
            request['pair'] = market['id']
        response = self.privatePostActiveOrders(self.extend(request, params))
        #
        #     {
        #         "success":1,
        #         "return":{
        #             "1255468911":{
        #                 "status":0,
        #                 "pair":"spike_usdt",
        #                 "type":"sell",
        #                 "amount":35028.44256388,
        #                 "rate":0.00199989,
        #                 "timestamp_created":1602684432
        #             }
        #         },
        #         "stat":{
        #             "isSuccess":true,
        #             "serverTime":"00:00:00.0000826",
        #             "time":"00:00:00.0091423",
        #             "errors":null
        #         }
        #     }
        #
        # it can only return 'open' orders(i.e. no way to fetch 'closed' orders)
        orders = self.safe_value(response, 'return', [])
        return self.parse_orders(orders, market, since, limit)

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = None
        # some derived classes use camelcase notation for request fields
        request = {
            # 'from': 123456789,  # trade ID, from which the display starts numerical 0(test result: liqui ignores self field)
            # 'count': 1000,  # the number of trades for display numerical, default = 1000
            # 'from_id': trade ID, from which the display starts numerical 0
            # 'end_id': trade ID on which the display ends numerical ∞
            # 'order': 'ASC',  # sorting, default = DESC(test result: liqui ignores self field, most recent trade always goes last)
            # 'since': 1234567890,  # UTC start time, default = 0(test result: liqui ignores self field)
            # 'end': 1234567890,  # UTC end time, default = ∞(test result: liqui ignores self field)
            # 'pair': 'eth_btc',  # default = all markets
        }
        if symbol is not None:
            market = self.market(symbol)
            request['pair'] = market['id']
        if limit is not None:
            request['count'] = int(limit)
        if since is not None:
            request['since'] = int(since / 1000)
        response = self.privatePostTradeHistory(self.extend(request, params))
        trades = self.safe_value(response, 'return', [])
        return self.parse_trades(trades, market, since, limit)

    def withdraw(self, code, amount, address, tag=None, params={}):
        tag, params = self.handle_withdraw_tag_and_params(tag, params)
        self.check_address(address)
        self.load_markets()
        currency = self.currency(code)
        request = {
            'asset': currency['id'],
            'amount': float(amount),
            'address': address,
        }
        if tag is not None:
            request['memo'] = tag
        response = self.privatePostCreateWithdraw(self.extend(request, params))
        #
        #     {
        #         "success":1,
        #         "return":{
        #             "withdraw_id":1111,
        #             "withdraw_info":{
        #                 "id":1111,
        #                 "asset_id":1,
        #                 "asset":"BTC",
        #                 "amount":0.0093,
        #                 "fee":0.0007,
        #                 "create_time":1575128018,
        #                 "status":"Created",
        #                 "data":{
        #                     "address":"1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY",
        #                     "memo":"memo",
        #                     "tx":null,
        #                     "error":null
        #                 },
        #             "in_blockchain":false
        #             }
        #         }
        #     }
        #
        result = self.safe_value(response, 'return', {})
        return {
            'info': response,
            'id': self.safe_string(result, 'withdraw_id'),
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        query = self.omit(params, self.extract_params(path))
        if api == 'private':
            self.check_required_credentials()
            nonce = self.nonce()
            body = self.urlencode(self.extend({
                'nonce': nonce,
                # 'request': path,
                'method': path,
            }, query))
            signature = self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Api-Key': self.apiKey,
                'Sign': signature,
            }
        elif api == 'public':
            url += '/' + self.implode_params(path, params)
            if query:
                url += '?' + self.urlencode(query)
        else:
            url += '/' + self.implode_params(path, params)
            if method == 'GET':
                if query:
                    url += '?' + self.urlencode(query)
            else:
                if query:
                    body = self.json(query)
                    headers = {
                        'Content-Type': 'application/json',
                    }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody):
        if response is None:
            return  # fallback to default error handler
        if 'success' in response:
            #
            # 1 - The exchange only returns the integer 'success' key from their private API
            #
            #     {"success": 1, ...} httpCode == 200
            #     {"success": 0, ...} httpCode == 200
            #
            # 2 - However, derived exchanges can return non-integers
            #
            #     It can be a numeric string
            #     {"sucesss": "1", ...}
            #     {"sucesss": "0", ...}, httpCode >= 200(can be 403, 502, etc)
            #
            #     Or just a string
            #     {"success": "true", ...}
            #     {"success": "false", ...}, httpCode >= 200
            #
            #     Or a boolean
            #     {"success": True, ...}
            #     {"success": False, ...}, httpCode >= 200
            #
            # 3 - Oversimplified, Python PEP8 forbids comparison operator(==) of different types
            #
            # 4 - We do not want to copy-paste and duplicate the code of self handler to other exchanges derived from Liqui
            #
            # To cover points 1, 2, 3 and 4 combined self handler should work like self:
            #
            success = self.safe_value(response, 'success', False)
            if isinstance(success, str):
                if (success == 'true') or (success == '1'):
                    success = True
                else:
                    success = False
            if not success:
                code = self.safe_string(response, 'code')
                message = self.safe_string(response, 'message')
                feedback = self.id + ' ' + body
                self.throw_exactly_matched_exception(self.exceptions['exact'], code, feedback)
                self.throw_exactly_matched_exception(self.exceptions['exact'], message, feedback)
                self.throw_broadly_matched_exception(self.exceptions['broad'], message, feedback)
                raise ExchangeError(feedback)  # unknown message