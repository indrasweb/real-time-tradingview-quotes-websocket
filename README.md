# ~Real-time quotes via TradingView websocket

After much investigation I settled on using TradingView for streaming ~real-time (maybe 300-500ms delay) quotes / volume / ticks. I believe this to be the cheapest ($15/month, or $90/year) and simplest method. The main advantage of TradingView is that you can stream everything cheaply... e.g. CME E-Mini/ES is only $4/month.

This code streams L1 quotes for CME E-mini, but you can upgrade your account ($60/month, or $360/year) and stream "1 second bars" which provide volume + trade data. Search Github for `chart_create_session tradingview` to figure out how to do this.
